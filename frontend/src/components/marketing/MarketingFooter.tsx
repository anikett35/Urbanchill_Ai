import Link from 'next/link';

export default function MarketingFooter() {
  const FOOTER_COLS = [
    {
      title: 'Platform',
      links: [
        { label: '3D Digital Twin', href: '/globe' },
        { label: 'Thermal Satellite API', href: '#features' },
        { label: 'Heat Risk Modeling', href: '#features' },
        { label: 'Cooling Simulation', href: '#features' },
        { label: 'Automated Reports', href: '#features' },
      ],
    },
    {
      title: 'Solutions',
      links: [
        { label: 'Municipal Planners', href: '#' },
        { label: 'Public Health Agencies', href: '#' },
        { label: 'Climate Resilience Teams', href: '#' },
        { label: 'Smart City Initiatives', href: '#' },
        { label: 'Enterprise GIS', href: '#' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Research Papers', href: '#' },
        { label: 'Methodology & Datasets', href: '#' },
        { label: 'Documentation', href: '#' },
        { label: 'API Reference', href: '#' },
        { label: 'Community Case Studies', href: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About UrbanChill AI', href: '#' },
        { label: 'Climate Mission', href: '#' },
        { label: 'Press & Media', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Contact Team', href: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-[#12201B] text-[#DCE6E0] border-t border-emerald-950 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 5-Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pb-16 border-b border-white/10">
          {/* Brand Blurb Column */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#16241F] via-[#1E7A52] to-[#E24E1B] shadow-md flex items-center justify-center overflow-hidden">
                <div className="w-2.5 h-2.5 rounded-full border border-white/40" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                UrbanChill <span className="text-[#E24E1B]">AI</span>
              </span>
            </div>
            <p className="text-sm text-[#A5B5AD] max-w-sm leading-relaxed">
              Geo-Intelligent Digital Twin Platform uniting multispectral satellite telemetry, machine learning, and spatial GIS to safeguard cities from extreme urban heat.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs font-mono text-[#A5B5AD]">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Global Satellite Telemetry Online</span>
            </div>
          </div>

          {/* 4 Link Columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.title} className="space-y-3.5">
              <h3 className="text-xs font-mono uppercase tracking-widest text-white font-bold">
                {col.title}
              </h3>
              <ul className="space-y-2.5 text-sm text-[#A5B5AD]">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-white transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Attribution & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A9B93]">
          <div>
            © {new Date().getFullYear()} UrbanChill AI Inc. All rights reserved.
          </div>
          <div className="font-mono text-[11px] text-center sm:text-right">
            Landsat-8 & Sentinel-2 imagery courtesy of USGS / ESA & Google Earth Engine.
          </div>
        </div>
      </div>
    </footer>
  );
}
