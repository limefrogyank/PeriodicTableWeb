import {FASTElement, customElement, attr, html, ref, css,when} from '@microsoft/fast-element';
import { ColumnDefinition, DataGrid, DataGridCell, Button } from '@microsoft/fast-foundation';
import { provideFASTDesignSystem, fastButton, fastDialog, fastDataGrid, fastDataGridRow, fastDataGridCell,neutralForegroundRest, accentFillRest  } from '@microsoft/fast-components';
import { SystemColors } from "@microsoft/fast-web-utilities";

provideFASTDesignSystem()
    .register(
        fastButton(),
        fastDataGrid(),
        fastDataGridRow(),
        fastDataGridCell(),  
    );

const template = html<ElementCell>`

<div class="main" style="margin-left:auto;margin-right:auto;padding:0; };">
    <div class="atomicNumber">${x=>x.number}</div>
    <div class="symbol">${x=>x.symbol}</div>    
</div>

`;

const styles = css`
.hidden {
    display: block;
}
.main {
    color: ${neutralForegroundRest.createCSS()};
}
.symbol{
    font-weight:bold;
}
.atomicNumber{
    font-size:x-small;
}

`;

@customElement({
	name: 'element-cell',
	template,
	styles 
})
export class ElementCell extends FASTElement {
	@attr symbol: string;
    @attr name: string;
    @attr number: number;
    @attr mass: number;
    @attr phase: string;
    
    @attr({ mode: 'boolean' }) showNames: boolean = true;
	@attr({ mode: 'boolean' }) showMasses: boolean = true;
    
    connectedCallback(){
		super.connectedCallback();
    }
}