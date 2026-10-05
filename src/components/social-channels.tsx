const channels = [
  { name: "Facebook", path: "M14 21v-8h3l.5-4H14V7c0-1 .3-2 2-2h2V1.5A24 24 0 0 0 15 1c-3 0-5 2-5 5v3H7v4h3v8" },
  { name: "X", path: "M4 3h4l12 18h-4L4 3Zm0 18 7-8M20 3l-7 8" },
  { name: "WhatsApp", path: "M21 11.5a9 9 0 0 1-13.5 8L3 21l1.5-4.5A9 9 0 1 1 21 11.5ZM8 7c0 5 4 9 9 9l1-3-3-1-1 2-4-4 2-1-1-3-3 1Z" },
  { name: "Gmail", path: "M3 5h18v14H3V5Zm0 1 9 7 9-7" },
  { name: "YouTube", path: "M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm6 3 6 4-6 4V8Z" },
];
export function SocialChannels() {
  return <div className="social-channels">{channels.map(channel => <a href="#" aria-label={channel.name} key={channel.name} className="social-icon">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={channel.path} /></svg>
  </a>)}</div>;
}
