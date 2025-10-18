export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10">
      <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-ink/60 text-sm">© {new Date().getFullYear()} TrendNest Media</p>
        <p className="text-ink/60 text-sm">Social Media • Google Ads • Local SEO</p>
      </div>
    </footer>
  );
}
