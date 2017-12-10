VHDL linter
======

Small atom linter for the VHDL language.

### Requirements
- [Linter](atom.io/packages/linter) atom package
- A VHDL compiler ([ghdl](http://ghdl.free.fr/) is recommended)

### Install
You can install through the CLI by doing:

```$ apm install linter-vhdl```

Or you can install from Settings view by searching for `vhdl`.

### Custom ghdl arguments

You can provide custom arguments to the vhdl executable by adding a comment at the top of the file

```-- args: [arguments]```

##### Exemple

```--args: --ieee=synopsys```

### Config
- VHDL compiler path (default: ghdl)
- Compile on lint (default: false)
