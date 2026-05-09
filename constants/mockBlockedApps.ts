export type MockBlockedApp = {
  id: string;
  name: string;
  icon: string;
};

export const MOCK_BLOCKABLE_APPS: MockBlockedApp[] = [
  { id: 'com.instagram.android', name: 'Instagram', icon: 'camera-outline' },
  { id: 'com.zhiliaoapp.musically', name: 'TikTok', icon: 'musical-notes-outline' },
  { id: 'com.twitter.android', name: 'Twitter / X', icon: 'chatbubble-ellipses-outline' },
  { id: 'com.google.android.youtube', name: 'YouTube', icon: 'logo-youtube' },
  { id: 'com.reddit.frontpage', name: 'Reddit', icon: 'logo-reddit' },
  { id: 'com.whatsapp', name: 'WhatsApp', icon: 'logo-whatsapp' },
];
