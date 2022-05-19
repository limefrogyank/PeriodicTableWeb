import {FASTElement, customElement, attr, html, ref, css,when, ValueConverter} from '@microsoft/fast-element';
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

<div class="main" style="margin-left:auto;margin-right:auto;padding:0;">
    <div class="atomicNumber" aria-label="Atomic Number ${x=>x.number}">${x=>x.number}</div>
    <div class="symbol" aria-label="Symbol ${x=>x.symbol.replace(/./g,' $&')}">${x=>x.symbol}</div>
    ${when(x=> x.showNames, html`<div class="name" aria-label="${x=>x.name}">${x=>x.name}</div>`)}
    <div class="mass" aria-label="Atomic Mass ${x=>precisionRound(x.mass, x.maxPrecision, x.minDecimals)}">${x=>precisionRound(x.mass, x.maxPrecision, x.minDecimals)}</div>
</div>

`;

// https://expertcodeblog.wordpress.com/2018/02/12/typescript-javascript-round-number-by-decimal-pecision/
function precisionRound(number: number, precision: number, minDecimals: number)
{
    //first check if exact number.  Any mass with no decimal is considered exact.
    if (number % 1 == 0){
        return number;
    }
    
    if (precision < 0)
    {
        let factor = Math.pow(10, precision);
        return Math.round(number * factor) / factor;
    }
    else {
        let result = +(Math.round(Number(number + "e+" + precision)) +
        "e-" + precision);
        
        if (minDecimals >= 0){
            console.log(result);
            let decimalPortion = (result % 1).toFixed(precision).substring(2);
            console.log(decimalPortion);
            let decimals= precision;
            while (decimalPortion.endsWith('0') && decimalPortion.length > minDecimals ) {
                decimalPortion = decimalPortion.substring(0, decimalPortion.length - 1);
                decimals--;
            }
            if (decimals != precision){
                console.log('decimals: ' + decimals + '  precision: ' + precision);
                return result.toFixed(decimals);
            } else {
                return result.toFixed(precision);
            }
        }
        return result;
    }
}

const styles = css`
.hidden {
    display: block;
}
.main {
    color: ${neutralForegroundRest.createCSS()};
    outline: 1px solid black;
}
.symbol{
    font-weight:bold;
    text-align:center;
}
.atomicNumber{
    font-size:small;
    text-align:center;
}
.name{
    font-size:6pt;
    line-height:6pt;
    text-align:center;
}
.mass{
    font-size:x-small;
    text-align:center; 
}

`;

const numberConverter: ValueConverter = {
    toView(value: any): string {
      return value.toString();
    },
  
    fromView(value: string): any {
        return parseFloat(value);
    }
  };

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
    
    @attr({ converter: numberConverter}) maxPrecision: number = 4;    
    @attr({ converter: numberConverter}) minDecimals: number = -1;
    @attr({ mode: 'boolean' }) showNames: boolean = true;
    
    connectedCallback(){
		super.connectedCallback();
    }
}