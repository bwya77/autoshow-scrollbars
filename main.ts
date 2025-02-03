import { App, Plugin, PluginSettingTab, Setting, WorkspaceLeaf } from 'obsidian';

interface ScrollbarSettings {
    hideDelay: number;
    showDelay: number;
    color: string;
    width: number;
}

const DEFAULT_SETTINGS: ScrollbarSettings = {
    hideDelay: 750,
    showDelay: 0,
    color: '#6790E3',
    width: 8
}

export class ScrollPlugin {
    private boundHandleScroll: (e: Event) => void;
    private settings: ScrollbarSettings;
    private timeouts: WeakMap<Element, number> = new WeakMap();

    constructor(workspace: any, settings: ScrollbarSettings) {
        this.settings = settings;
        this.boundHandleScroll = this.handleScroll.bind(this);
        this.initForWorkspace();
    }

    public updateSettings(settings: ScrollbarSettings): void {
        this.settings = settings;
        this.updateStyles();
    }

    private updateStyles(): void {
        document.documentElement.style.setProperty('--scrollbar-width', `${this.settings.width}px`);
        document.documentElement.style.setProperty('--scrollbar-color', this.settings.color);
    }

    private initForWorkspace(): void {
        this.updateStyles();
        document.body.classList.add('auto-hide-scrollbar');
        
        // Use capture phase to catch all scroll events
        document.addEventListener('scroll', this.boundHandleScroll, { 
            capture: true,
            passive: true 
        });
    }

    private handleScroll(e: Event): void {
        if (!e.target || !(e.target instanceof Element)) return;
        
        const container = e.target;
        const timeoutId = this.timeouts.get(container);
        
        if (timeoutId) {
            window.clearTimeout(timeoutId);
        }

        // Add scrolling class after delay
        if (this.settings.showDelay > 0) {
            setTimeout(() => {
                container.classList.add('scrolling');
            }, this.settings.showDelay);
        } else {
            container.classList.add('scrolling');
        }

        // Set timeout to remove scrolling class
        const newTimeoutId = window.setTimeout(() => {
            container.classList.remove('scrolling');
            this.timeouts.delete(container);
        }, this.settings.hideDelay + this.settings.showDelay);

        this.timeouts.set(container, newTimeoutId);
    }

    public destroy(): void {
        document.body.classList.remove('auto-hide-scrollbar');
        document.removeEventListener('scroll', this.boundHandleScroll, true);
        
        // Clear all timeouts
        document.querySelectorAll('.scrolling').forEach(el => {
            el.classList.remove('scrolling');
            const timeoutId = this.timeouts.get(el);
            if (timeoutId) {
                window.clearTimeout(timeoutId);
            }
        });
        
        // Remove CSS variables
        document.documentElement.style.removeProperty('--scrollbar-width');
        document.documentElement.style.removeProperty('--scrollbar-color');
    }
}
export class ScrollbarSettingTab extends PluginSettingTab {
   plugin: AutoShowScrollbarsPlugin;

   constructor(app: App, plugin: AutoShowScrollbarsPlugin) {
       super(app, plugin);
       this.plugin = plugin;
   }

   display(): void {
       const { containerEl } = this;
       containerEl.empty();

       new Setting(containerEl)
           .setName('Show Delay')
           .setDesc('How long to wait before showing the scrollbar (in milliseconds)')
           .addText(text => text
               .setValue(String(this.plugin.settings.showDelay))
               .onChange(async (value) => {
                   const delay = Number(value);
                   if (!isNaN(delay) && delay >= 0) {
                       this.plugin.settings.showDelay = delay;
                       await this.plugin.saveSettings();
                   }
               }));

       new Setting(containerEl)
           .setName('Hide Delay')
           .setDesc('How long to keep the scrollbar visible after scrolling stops (in milliseconds)')
           .addText(text => text
               .setValue(String(this.plugin.settings.hideDelay))
               .onChange(async (value) => {
                   const delay = Number(value);
                   if (!isNaN(delay) && delay > 0) {
                       this.plugin.settings.hideDelay = delay;
                       await this.plugin.saveSettings();
                   }
               }));

       new Setting(containerEl)
           .setName('Scrollbar Color')
           .setDesc('Color of the scrollbar (hex code)')
           .addText(text => text
               .setValue(this.plugin.settings.color)
               .onChange(async (value) => {
                   if (value.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
                       this.plugin.settings.color = value;
                       await this.plugin.saveSettings();
                   }
               }));

       new Setting(containerEl)
           .setName('Scrollbar Width')
           .setDesc('Width of the scrollbar in pixels')
           .addText(text => text
               .setValue(String(this.plugin.settings.width))
               .onChange(async (value) => {
                   const width = Number(value);
                   if (!isNaN(width) && width > 0) {
                       this.plugin.settings.width = width;
                       await this.plugin.saveSettings();
                   }
               }));
   }
}

export default class AutoShowScrollbarsPlugin extends Plugin {
   private scrollPlugin: ScrollPlugin;
   settings: ScrollbarSettings;

   async onload() {
       await this.loadSettings();
       
       const workspace = this.app.workspace;
       this.scrollPlugin = new ScrollPlugin(workspace, this.settings);
       
       this.addSettingTab(new ScrollbarSettingTab(this.app, this));
   }

   async loadSettings() {
       this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
   }

   async saveSettings() {
       await this.saveData(this.settings);
       this.scrollPlugin.updateSettings(this.settings);
   }

   onunload() {
       this.scrollPlugin?.destroy();
   }
}