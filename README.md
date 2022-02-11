# Periodic Table web element
This is a periodic table you can add to any webpage.  Just add the javascript bundle, then use the custom web element:

```
<script defer="defer" src="periodicTable.js"></script>

<periodic-table></periodic-table>
```

## Attributes

Apply any or all of these attributes to customize the appearance of the periodic table.

`hideTransitionMetals` - **boolean** - default: false - Hides the transition metals and lanthanides/actinides.

`showNames` - **boolean** - default: false - Shows name of element underneath symbol.

`casGroupNames` - **boolean** - default: false - Replaces IUPAC group numbers (1-18) with IA, IIB, etc CAS group names.

`colorMode` - **"light" | "dark" | "system"** - default: "system" - Overrides browser default luminance mode (i.e. light mode/dark mode)

![image](https://user-images.githubusercontent.com/7821384/153533584-40e6afdd-bbdb-4bf1-9a75-94c99ddeff34.png)
