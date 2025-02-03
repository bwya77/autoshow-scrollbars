# auto-show Scrollbars for Obsidian

Automatically hides scrollbars when not in use while keeping them easily accessible during scrolling, creating a clean, distraction-free reading experience without sacrificing navigation functionality.

![Demo video](/images/demo.gif) 

## Features

- **Smart Auto-Hiding**: Scrollbars automatically hide when not in use
- **Instant Access**: Scrollbars appear immediately when scrolling starts
- **Hover Detection**: Show scrollbars when hovering over their area
- **Theme Integration**: Uses your theme's accent color by default
- **Smooth Animations**: Clean transitions for showing/hiding
- **Resource Efficient**: Uses passive event listeners and CSS transitions

## Installation

1. Open Obsidian Settings
2. Navigate to Community Plugins and disable Safe Mode
3. Click Browse and search for "autoshow Scrollbars"
4. Install the plugin
5. Enable the plugin in your Community Plugins list

### Manual Installation

1. Download the latest release from the releases page
2. Extract the files into your vault's `.obsidian/plugins/autoshow-scrollbars/` directory
3. Reload Obsidian
4. Enable the plugin in your Community Plugins list

## Usage

Once installed and enabled, AutoShow Scrollbars works automatically with no additional configuration needed. The plugin will immediately begin managing your scrollbars according to your interaction.

### Configuration

You can customize the following settings in the plugin options:

![Plugin Settings](/images/autoshow_settings.png) 

- **Show Delay**: How long to wait before showing scrollbars when scrolling starts (default: 0ms)
- **Hide Delay**: How long scrollbars remain visible after scrolling stops (default: 750ms)
- **Scrollbar Color**: Custom color override for scrollbars (default: uses theme accent)

## Compatibility

- Requires Obsidian v1.0.0 or higher
- Works on all platforms (Windows, macOS, Linux, iOS, Android)
- Compatible with most themes and plugins

## Support

If you find this plugin helpful, you can:

- Create an issue on [GitHub](https://github.com/bwya77/autoshow-scrollbars/issues)
- Support the development:
  - [Buy Me a Coffee](https://buymeacoffee.com/bwya77)
  - [GitHub Sponsor](https://github.com/sponsors/bwya77)

## Development

Want to contribute or modify the plugin? Here's how to get started with the source code:

1. Create a directory for your GitHub projects:
   ```bash
   cd path/to/somewhere
   mkdir Github
   cd Github
   ```

2. Clone the repository:
   ```bash
   git clone https://github.com/bwya77/autoshow-scrollbars.git
   ```

3. Navigate to the plugin directory:
   ```bash
   cd auto-show-scrollbars
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Start development build mode:
   ```bash
   npm run dev
   ```
   This command will keep running in the terminal and automatically rebuild the plugin whenever you make changes to the source code.

6. You'll see a `main.js` file appear in the plugin directory - this is the compiled version of your plugin.

### Testing Your Changes

To test your modifications:

1. Create a symbolic link or copy your plugin folder to your vault's `.obsidian/plugins/` directory
2. Enable the plugin in Obsidian's community plugins settings
3. Use the developer console (Ctrl+Shift+I) to check for errors and debug

### Making Contributions

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request with a clear description of your changes

## License

MIT License. See [LICENSE](https://github.com/bwya77/autoshow-scrollbars/blob/main/LICENSE) for full text.