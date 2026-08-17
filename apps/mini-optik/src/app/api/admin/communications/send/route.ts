import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * Çoklu Kanal Gönderim API'si
 *
 * Body (yeni format — kanal başına şablon):
 * - customerIds: string[]
 * - channelConfigs: Array<{
 *     channel: "SMS" | "WHATSAPP" | "EMAIL",
 *     templateId?: string | null,
 *     customMessage?: string | null,
 *     emailSubject?: string | null,   // sadece custom message modunda kullanılır
 *   }>
 *
 * Eski format hâlâ desteklenir (geriye dönük uyumluluk):
 * - channels, templateId, customMessage, emailSubject
 *
 * Mantık: Eksik bilgisi (telefon/email) olan müşteriler sessizce atlanır.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.firmId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { customerIds } = body;

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json({ error: "Müşteri seçilmedi." }, { status: 400 });
    }

    // ─── Build normalized channel configs ───────────────────────────────────
    type ChannelCfg = {
      channel: string;
      templateId?: string | null;
      customMessage?: string | null;
      emailSubject?: string | null;
    };

    let channelConfigs: ChannelCfg[] = [];

    if (Array.isArray(body.channelConfigs) && body.channelConfigs.length > 0) {
      // NEW FORMAT: per-channel configs
      channelConfigs = body.channelConfigs;
    } else if (Array.isArray(body.channels) && body.channels.length > 0) {
      // LEGACY FORMAT: single template / message for all channels
      channelConfigs = body.channels.map((ch: string) => ({
        channel: ch,
        templateId: body.templateId || null,
        customMessage: body.customMessage || null,
        emailSubject: body.emailSubject || null,
      }));
    } else {
      return NextResponse.json({ error: "Kanal seçilmedi." }, { status: 400 });
    }

    // ─── Resolve templates for each channel ─────────────────────────────────
    // Collect unique template IDs to fetch in one query
    const templateIds = [...new Set(
      channelConfigs.map(c => c.templateId).filter(Boolean) as string[]
    )];

    const templateMap: Record<string, { content: string; subject: string | null }> = {};
    if (templateIds.length > 0) {
      const dbTemplates = await prisma.messageTemplate.findMany({
        where: { id: { in: templateIds }, firmId: session.firmId },
      });
      for (const t of dbTemplates) {
        templateMap[t.id] = { content: t.content, subject: t.subject ?? null };
      }
    }

    // ─── Validate content per channel ────────────────────────────────────────
    for (const cfg of channelConfigs) {
      const hasTemplate = cfg.templateId && templateMap[cfg.templateId];
      const hasCustom   = cfg.customMessage?.trim();
      if (!hasTemplate && !hasCustom) {
        return NextResponse.json(
          { error: `${cfg.channel} kanalı için mesaj içeriği boş olamaz.` },
          { status: 400 }
        );
      }
    }

    // ─── Fetch customers ─────────────────────────────────────────────────────
    const customers = await prisma.customer.findMany({
      where: { id: { in: customerIds }, firmId: session.firmId },
    });

    const logs: any[] = [];
    const skipped: { customerId: string; channel: string; reason: string }[] = [];

    for (const customer of customers) {
      for (const cfg of channelConfigs) {
        const tpl = cfg.templateId ? templateMap[cfg.templateId] : null;
        const rawContent = tpl?.content ?? cfg.customMessage ?? "";
        const subject    = tpl?.subject ?? cfg.emailSubject ?? null;

        // Replace variables
        const content = rawContent
          .replace(/{MusteriAdi}/g, `${customer.firstName} ${customer.lastName}`)
          .replace(/{Telefon}/g,  customer.phone || "")
          .replace(/{Email}/g,    customer.email || "");

        if (cfg.channel === "SMS" || cfg.channel === "WHATSAPP") {
          if (!customer.phone) {
            skipped.push({ customerId: customer.id, channel: cfg.channel, reason: "Telefon numarası eksik" });
            continue;
          }
          // MOCK SEND — Gerçek sistemde Netgsm / Twilio burada çağrılır
          logs.push({
            firmId: session.firmId,
            customerId: customer.id,
            to: customer.phone,
            type: cfg.channel,
            content,
            status: "SENT",
          });
        } else if (cfg.channel === "EMAIL") {
          if (!customer.email) {
            skipped.push({ customerId: customer.id, channel: "EMAIL", reason: "E-posta adresi eksik" });
            continue;
          }
          // MOCK SEND — Gerçek sistemde SendGrid / Resend burada çağrılır
          logs.push({
            firmId: session.firmId,
            customerId: customer.id,
            to: customer.email,
            type: "EMAIL",
            content: subject ? `Konu: ${subject}\n\n${content}` : content,
            status: "SENT",
          });
        }
      }
    }

    if (logs.length > 0) {
      await prisma.messageLog.createMany({ data: logs });
    }

    return NextResponse.json({
      success: true,
      sent: logs.length,
      skipped: skipped.length,
      skippedDetails: skipped,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
