import {FASTElement, customElement, attr, html, ref, css,when} from '@microsoft/fast-element';
import {DataGridRow, dataGridRowStyles as oldstyles} from '@microsoft/fast-components';
import {  dataGridRowTemplate as template, ElementDefinitionContext } from '@microsoft/fast-foundation';
import { neutralFillRest, neutralStrokeDividerRest, strokeWidth } from "@microsoft/fast-components";
import {
  eventFocusOut,
  eventKeyDown,
  keyArrowLeft,
  keyArrowRight,
  keyEnd,
  keyHome,
} from "@microsoft/fast-web-utilities";


const styles = css`
:host {
  display: grid;
  padding: 1px 0;
  box-sizing: border-box;
  width: 100%;
  border-bottom: calc(${strokeWidth} * 1px) solid ${neutralStrokeDividerRest};
}
:host(.header) {
}
:host(.sticky-header) {
  background: ${neutralFillRest};
  position: sticky;
  top: 0;
}
`;

export class DataGridRow2 extends DataGridRow {
  connectedCallback(): void {
      super.connectedCallback();
  }


  override handleKeydown(e: KeyboardEvent): void {
    if (e.defaultPrevented) {
      return;
    }
    let newFocusColumnIndex: number = 0;
    switch (e.key) {
        case keyArrowLeft:
            // focus left one cell
            let prevCandidateCell = Math.max(0, this.focusColumnIndex - 1);
            while (this.cellElements[prevCandidateCell].childElementCount == 0 && prevCandidateCell > 0){
              prevCandidateCell-=1;
              prevCandidateCell = Math.max(0, prevCandidateCell);
            } 
            //newFocusColumnIndex = Math.max(0, this.focusColumnIndex - 1);
            if (this.cellElements[prevCandidateCell].childElementCount != 0){
              newFocusColumnIndex = prevCandidateCell;
            } else {
              newFocusColumnIndex = this.focusColumnIndex;
            }
            (this.cellElements[newFocusColumnIndex] as HTMLElement).focus();
            e.preventDefault();
            break;

        case keyArrowRight:
            // focus right one cell and skips empty cells!
            let nextCandidateCell = Math.min(
              this.cellElements.length - 1,
              this.focusColumnIndex + 1
            );
            while (this.cellElements[nextCandidateCell].childElementCount == 0 && nextCandidateCell != this.cellElements.length-1){
              nextCandidateCell+=1;
              nextCandidateCell = Math.min(
                this.cellElements.length - 1,
                nextCandidateCell);
            } 
            if (this.cellElements[nextCandidateCell].childElementCount != 0){
              newFocusColumnIndex = nextCandidateCell;
            } else {
              newFocusColumnIndex = this.focusColumnIndex;
            }
            (this.cellElements[newFocusColumnIndex] as HTMLElement).focus();
            e.preventDefault();
            break;

        case keyHome:
            if (!e.ctrlKey) {
                (this.cellElements[0] as HTMLElement).focus();
                e.preventDefault();
            }
            break;
        case keyEnd:
            if (!e.ctrlKey) {
                // focus last cell of the row
                (this.cellElements[
                    this.cellElements.length - 1
                ] as HTMLElement).focus();
                e.preventDefault();
            }
            break;
    }
  }
}

export const fastDataGridRow2 = DataGridRow2.compose({
    baseName: 'data-grid-row-2',
    template,
    styles,
    shadowOptions:{
      delegatesFocus:true
    }
  });
  