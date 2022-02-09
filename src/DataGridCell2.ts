import {FASTElement, customElement, attr, html, ref, css,when} from '@microsoft/fast-element';
import {DataGridCell, dataGridCellStyles as oldstyles} from '@microsoft/fast-components';
import {  dataGridCellTemplate as template, ElementDefinitionContext,
    focusVisible,
    forcedColorsStylesheetBehavior } from '@microsoft/fast-foundation';
import {  bodyFont,
    controlCornerRadius,
    designUnit,
    focusStrokeOuter,
    neutralForegroundRest,
    strokeWidth,
    typeRampBaseFontSize,
    typeRampBaseLineHeight, } from "@microsoft/fast-components";
    
import {
  eventFocusOut,
  eventKeyDown,
  SystemColors,
  keyArrowLeft,
  keyArrowRight,
  keyEnd,
  keyHome,
} from "@microsoft/fast-web-utilities";


const styles = css`
:host {
    padding: calc(${designUnit} * 1px) calc(${designUnit} * 3px);
    color: ${neutralForegroundRest};
    box-sizing: border-box;
    font-family: ${bodyFont};
    font-size: ${typeRampBaseFontSize};
    line-height: ${typeRampBaseLineHeight};
    font-weight: 400;
    border: transparent calc(${strokeWidth} * 1px) solid;
    overflow: hidden;
    white-space: nowrap;
    border-radius: calc(${controlCornerRadius} * 1px);
}
:host(.column-header) {
    font-weight: 600;
}
:host(:${focusVisible}) {
    border: ${focusStrokeOuter} calc(${strokeWidth} * 1px) solid;
    color: ${neutralForegroundRest};
}
`.withBehaviors(
    forcedColorsStylesheetBehavior(
        css`
    :host {
        forced-color-adjust: none;
        border-color: transparent;
        background: ${SystemColors.Field};
        color: ${SystemColors.FieldText};
    }
    :host(:${focusVisible}) {
        border-color: ${SystemColors.FieldText};
        box-shadow: 0 0 0 2px inset ${SystemColors.Field};
        color: ${SystemColors.FieldText};
    }
`));

export class DataGridCell2 extends DataGridCell {
  connectedCallback(): void {
      super.connectedCallback();
  }


 
  
}

export const fastDataGridCell2 = DataGridCell2.compose({
    baseName: 'data-grid-cell-2',
    template,
    styles,
    shadowOptions:{
      delegatesFocus:true
    }
  });
  