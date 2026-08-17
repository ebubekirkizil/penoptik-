# Strict Isolation and Permission Rule

<!-- BEGIN:monorepo-isolation-rule -->
## Proje ve Ortak Kod İzolasyonu
Şu anda bir Monorepo mimarisine geçiş yapıyoruz veya çalışıyoruz. 
Aşağıdaki kural KESİN ve ESNETİLEMEZ bir kuraldır:

Bir uygulama (örneğin `mega-admin`) için çalışırken, başka bir uygulamayı (örneğin `penoptik`) etkileyebilecek HİÇBİR dosyada doğrudan değişiklik yapamazsın.
Eğer ortak bir pakette (`packages/database`, `packages/ui` vb.) veya başka bir uygulamanın dosyasında değişiklik yapman GEREKİYORSA, **önce mutlaka kullanıcıya sorup onay almalısın.**

Örnek Soru Formatı:
"Mega admin paneli için şu değişikliği yapmak üzereyiz, ancak bu değişiklik `packages/database` içerisindeki Prisma şemasını (ve dolayısıyla Pen Optik uygulamasını) etkileyecek. Bunu onaylıyor musunuz?"

Kullanıcı açıkça onay vermeden (veya `ask_question` tool'u üzerinden onay almadan) ortak dosyalarda veya farklı panellerde işlem yapmak YASAKTIR.
<!-- END:monorepo-isolation-rule -->



<!-- BEGIN:vercel-deploy-rule -->
## Otomatik Vercel Deploy Kural�
Kullan�c�n�n kesin talimat�d�r: Pen Optik (mini-optik) veya di�er projelerde herhangi bir geli�tirme/d�zeltme i�lemi ba�ar�yla tamamland���nda, kullan�c�dan ekstra bir talimat veya onay beklemeden ilgili projeyi Vercel'a 'vercel --prod' komutu ile deploy et ve sonucu kullan�c�ya bildir.
<!-- END:vercel-deploy-rule -->
