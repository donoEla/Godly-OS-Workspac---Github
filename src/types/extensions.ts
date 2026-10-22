export interface DesktopExtension {
  id: string;
  name: string;
  author: string;
  version: string;
  description: string;
  icon: string;
  category: 'Animations' | 'Visuals' | 'Productivity' | 'Audio' | 'Custom';
  enabled: boolean;
  isBuiltIn: boolean;
  customCss?: string;
  customJs?: string;
  config?: Record<string, any>;
  tags?: string[];
}

export interface ExtensionsContextType {
  extensions: DesktopExtension[];
  toggleExtension: (id: string) => void;
  installExtension: (ext: DesktopExtension) => void;
  uninstallExtension: (id: string) => void;
  updateExtension: (id: string, updates: Partial<DesktopExtension>) => void;
  exportExtensions: () => string;
  importExtensions: (jsonString: string) => boolean;
  getShareableLink: () => string;
  isExtensionEnabled: (id: string) => boolean;
}
