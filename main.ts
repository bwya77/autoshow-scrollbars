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
   private containers: Set<HTMLElement> = new Set();
   private timeouts: Map<HTMLElement, number> = new Map();
   private boundHandleScroll: (e: Event) => void;
   private settings: ScrollbarSettings;

   constructor(workspace: any, settings: ScrollbarSettings) {
       this.settings = settings;
       this.boundHandleScroll = this.handleScroll.bind(this);
       this.initForWorkspace(workspace);
   }

   public updateSettings(settings: ScrollbarSettings): void {
       this.settings = settings;
       this.updateStyles();
   }

   private updateStyles(): void {
       document.documentElement.style.setProperty('--scrollbar-width', `${this.settings.width}px`);
       document.documentElement.style.setProperty('--scrollbar-color', this.settings.color);
   }

   private initForWorkspace(workspace: any): void {
       this.updateStyles();
       workspace.iterateAllLeaves((leaf: WorkspaceLeaf) => {
           const view = leaf.view.containerEl;
           const contentContainers = view.querySelectorAll('.cm-scroller, .markdown-preview-view');
           contentContainers.forEach((container: HTMLElement) => this.addContainer(container));
       });
       
       // Add modal and sidebar containers
const modalContainers = document.querySelectorAll('.mod-settings .modal-content, .mod-sidebar-layout .vertical-tabs-container, .community-modal .vertical-tab-content-container, .vertical-tab-header');   }

   private addContainer(container: HTMLElement): void {
       container.classList.add('auto-hide-scrollbar');
       container.addEventListener('scroll', this.boundHandleScroll);
       this.containers.add(container);
   }

   private handleScroll(e: Event): void {
       const container = e.target as HTMLElement;
       const existingTimeout = this.timeouts.get(container);
       if (existingTimeout) window.clearTimeout(existingTimeout);
       
       setTimeout(() => {
           container.classList.add('scrolling');
       }, this.settings.showDelay);
       
       const hideTimeout = window.setTimeout(() => {
           container.classList.remove('scrolling');
       }, this.settings.hideDelay + this.settings.showDelay);
       
       this.timeouts.set(container, hideTimeout);
   }

   public destroy(): void {
       this.containers.forEach(container => {
           container.removeEventListener('scroll', this.boundHandleScroll);
           container.classList.remove('auto-hide-scrollbar');
           const timeout = this.timeouts.get(container);
           if (timeout) window.clearTimeout(timeout);
       });
       this.containers.clear();
       this.timeouts.clear();
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