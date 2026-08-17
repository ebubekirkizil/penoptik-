export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] space-y-4 animate-in fade-in duration-500">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">Sayfa yükleniyor, lütfen bekleyin...</p>
    </div>
  );
}
