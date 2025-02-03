import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface ScrollbarSettings {
    hideDelay: number;
    showDelay: number;
    color: string | null; // null means use accent color
}

const DEFAULT_SETTINGS: ScrollbarSettings = {
    hideDelay: 750,
    showDelay: 0,
    color: null // Default to using accent color
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
        this.updateScrollbarColor();
    }

    private updateScrollbarColor(): void {
        if (this.settings.color) {
            document.body.setAttribute('data-scrollbar-color', '');
            document.documentElement.style.setProperty('--custom-scrollbar-color', this.settings.color);
        } else {
            document.body.removeAttribute('data-scrollbar-color');
            document.documentElement.style.removeProperty('--custom-scrollbar-color');
        }
    }

    private initForWorkspace(): void {
        this.updateScrollbarColor();
        document.body.classList.add('auto-hide-scrollbar');
        
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

        if (this.settings.showDelay > 0) {
            setTimeout(() => {
                container.classList.add('scrolling');
            }, this.settings.showDelay);
        } else {
            container.classList.add('scrolling');
        }

        const newTimeoutId = window.setTimeout(() => {
            container.classList.remove('scrolling');
            this.timeouts.delete(container);
        }, this.settings.hideDelay + this.settings.showDelay);

        this.timeouts.set(container, newTimeoutId);
    }

    public destroy(): void {
        document.body.classList.remove('auto-hide-scrollbar');
        document.removeEventListener('scroll', this.boundHandleScroll, true);
        
        document.querySelectorAll('.scrolling').forEach(el => {
            el.classList.remove('scrolling');
            const timeoutId = this.timeouts.get(el);
            if (timeoutId) {
                window.clearTimeout(timeoutId);
            }
        });
        
        document.body.removeAttribute('data-scrollbar-color');
        document.documentElement.style.removeProperty('--custom-scrollbar-color');
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
            .setDesc('Custom color (hex value) for the scrollbar (leave empty to use theme accent color)')
            .addText(text => text
                .setValue(this.plugin.settings.color || '')
                .setPlaceholder('Theme accent color')
                .onChange(async (value) => {
                    if (!value.trim()) {
                        this.plugin.settings.color = null;
                        await this.plugin.saveSettings();
                        return;
                    }

                    try {
                        const temp = document.createElement('div');
                        temp.style.color = value;
                        document.body.appendChild(temp);
                        const computedColor = getComputedStyle(temp).color;
                        document.body.removeChild(temp);
                        
                        this.plugin.settings.color = value;
                        await this.plugin.saveSettings();
                    } catch (e) {
                        console.log('Invalid color value:', value);
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