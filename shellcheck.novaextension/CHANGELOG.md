## Version 1.3

- Include the shellcheck error code in the issue's message. This is enabled by default, but may be disabled in the
  extension's settings. Thanks [@gkarag](https://github.com/gkarag) 🙏 for the feature request.

## Version 1.2

- Run `shellcheck` process with the working directory of the Nova Workspace. This ensures that `shellcheck`
  respects the `.shellcheckrc` file in the project's directory. Thanks [@samdoran](https://github.com/samdoran) 🙏

## Version 1.1

- Add funding link. If this extension benefits your professional workflow, and you have the means, perhaps you'd
  consider [buying me coffee](https://www.buymeacoffee.com/ollylegg). Thanks!
- Pipe editor content into `shellcheck` via stdin. This allows for checking unsaved files, files with unsaved
  changes, and remote files.
- Convert build process to use typescript

## Version 1.0

- Initial release
