import {FASTElement, customElement, attr, html, ref, css,when} from '@microsoft/fast-element';
import { ColumnDefinition, DataGrid, DataGridCell, Button } from '@microsoft/fast-foundation';
import { provideFASTDesignSystem, fastButton, fastDialog, fastDataGrid, fastDataGridRow, fastDataGridCell, StandardLuminance } from '@microsoft/fast-components';
import {baseLayerLuminance, neutralFillRest} from '@microsoft/fast-components';
import {periodicTableData} from './elements';
import {ElementCell} from './elementCell';
import {ChemicalElementButton, chemicalElementButton} from './elementButton';
import {DataGridRow2, fastDataGridRow2} from './DataGridRow2';
import {DataGrid2, fastDataGrid2} from './DataGrid2';


// provideFluentDesignSystem()
// .register(fluentButton())
// .register(fluentDialog())
// .register(fluentDataGrid())
// .register(fluentDataGridRow())
// .register(fluentDataGridCell())
// .register(chemicalElementButton());
provideFASTDesignSystem()
    .register(
        fastButton(),
        fastDataGrid(),
        fastDataGridRow(),
        fastDataGridCell(), 
        fastDataGridRow2(),
        fastDataGrid2()    
    );
//DataGridRow2;
//Button;
//Dialog;
// FluentDialogEx;
//DataGrid;
ChemicalElementButton;
ElementCell;

const template = html<PeriodicTable>`

<div style="margin-left:auto;margin-right:auto;" class="main">
    <fast-data-grid-2 ${ref("periodicTableGrid")} grid-template-columns="42px 42px 42px 42px 42px 42px 42px 42px 42px 42px 42px 42px 42px 42px 42px 42px 42px 42px 42px" ></data-grid>
</div>

`;

const styles = css`
  .hidden {
    display: block;
  }
  .main {
      background: ${neutralFillRest.createCSS()};
  }

`;

enum LuminanceMode{
    light,
    dark,
    system
}

@customElement({
	name: 'periodic-table',
	template,
	styles 
})
export class PeriodicTable extends FASTElement {
	@attr({ mode: 'boolean' }) visible: boolean = false;
	@attr({ mode: 'boolean' }) hideTransitionMetals:boolean=false;
    @attr({ mode: 'boolean' }) romanGroupNumbers:boolean=true;
    @attr colorMode :string = "light";

	cancelButton: HTMLButtonElement;

	overlay: HTMLDivElement;
	mainModal:HTMLDivElement;

	periodicTableGrid: DataGrid;

	connectedCallback(){ 
		super.connectedCallback(); 
  
        if (LuminanceMode[this.colorMode] != LuminanceMode.system){
            baseLayerLuminance.setValueFor(document.body, LuminanceMode[this.colorMode] == LuminanceMode.dark ? StandardLuminance.DarkMode : StandardLuminance.LightMode);
		}
        //this.overlay = this.ownerDocument.createElement('div');
		//this.overlay.classList.add('modal-backdrop');
		//this.overlay.classList.add('fade');

		let elementButtons = this.querySelectorAll(".element");
		// for (let i=0; i < elementButtons.length; i++){
		// 	elementButtons.item(i).addEventListener('click', )
		// }
		// this.cancelButton.onclick = (ev) => {
		// 	this.visible=false;
		// 	this.$emit('dismiss');
		// };
		

		let elements = periodicTableData.elements;
		var sortedElements = [];
		var row = new Object();
		let groupMapping: Map<number,string> = new Map<number,string>([
			[1,'IA'],
			[2,'IIA'],
			[3,'IIIB'],
			[4,'IVB'],
			[5,'VB'],
			[6,'VIB'],
			[7,'VIIB'],
			[8,'VIIIB'],
			[9,'VIIIB'],
			[10,'VIIIB'],
			[11,'IB'],
			[12,'IIB'],
			[13,'IIIA'],
			[14,'IVA'],
			[15,'VA'],
			[16,'VIA'],
			[17,'VIIA'],
			[18,'VIIIA']
		]);
		for (let period = 1; period < (this.hideTransitionMetals ? 7 : 11); period++){
			for (let group = 1; group<=18; group++){
				let found = elements.find(x=>x.xpos == group && x.ypos == period);
				if (found !== undefined){
					row[group] = found;
				}else{
					row[group] = {'number': -1};
				}
			}
			sortedElements.push(row);
			row = new Object();
		}

        
		this.periodicTableGrid.rowsData = sortedElements;

		const buttonCellTemplate = html<DataGridCell>`
			<template>
				${when(y =>
				y.rowData === null || y.columnDefinition === null || y.columnDefinition.columnDataKey === null
				? false
				: y.columnDefinition.columnDataKey != "0" && y.rowData[y.columnDefinition.columnDataKey].number != -1, html<DataGridCell>`
				<element-cell symbol="${x => x.rowData[x.columnDefinition.columnDataKey].symbol}"
                            number="${x => x.rowData[x.columnDefinition.columnDataKey].number}">
				</element-cell>
				`)}
			</template>
			`;

            const headerContentCellTemplate = html<DataGridCell>`
			<template>
				<div style="padding:0; color:black; font-size:small; text-align:center;">
						${x => 
							x.rowData === null || x.columnDefinition === null || x.columnDefinition.columnDataKey === null
							? (this.romanGroupNumbers ? groupMapping.get(+x.columnDefinition.columnDataKey) : x.columnDefinition.columnDataKey)
							: x.rowData[x.columnDefinition.columnDataKey].symbol}
				</div>
				
			</template>
			`;
			

			const customCellItemTemplate = html`
			<fast-data-grid-cell
				style="padding:0;"
				grid-column="${(x, c) => c.index + 1}"
				:rowData="${(x, c) => c.parent.rowData}"
				:columnDefinition="${x => x}"
			></fast-data-grid-cell>
			`;

		const customRowItemTemplate = html`
		<fast-data-grid-row-2
					style="padding:0;border-bottom:0;"
			:rowData="${x => x}"
			:cellItemTemplate="${(x, c) => c.parent.cellItemTemplate}"
			:headerCellItemTemplate="${(x, c) => c.parent.headerCellItemTemplate}"
		></fast-data-grid-row-2>
		`;

		const headerCellTemplate = html`
			<fast-data-grid-cell 
                            style="padding:0;"
				cell-type="columnheader"
				grid-column="${(x, c) => c.index + 1}"
                :rowData="${(x, c) => c.parent.rowData}"
				:columnDefinition="${x => x}"
			>
            </fast-data-grid-cell>
		`;

		let colDefs:ColumnDefinition[];
		if (this.hideTransitionMetals){
			colDefs = [	
				{
					
					columnDataKey: '1',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				},
				{
					columnDataKey: '2',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				},
				{
					columnDataKey: '0',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				},
				{
					columnDataKey: '13',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				},
				{
					columnDataKey: '14',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				},
				{
					columnDataKey: '15',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				},
				{
					columnDataKey: '16',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				},
				{
					columnDataKey: '17',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				},
				{
					columnDataKey: '18',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				}
			];
		}else {
			colDefs = [	
				{
					
					columnDataKey: '1',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				},
				{
					columnDataKey: '2',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				},
				{
					columnDataKey: '3',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				},
				{
					columnDataKey: '4',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				},
				{
					columnDataKey: '5',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				},
				{
					columnDataKey: '6',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				},
				{
					columnDataKey: '7',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				},
				{
					columnDataKey: '8',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				},
				{
					columnDataKey: '9',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				},
				{
					columnDataKey: '10',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				},
				{
					columnDataKey: '11',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				},
				{
					columnDataKey: '12',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				},
				{
					columnDataKey: '13',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				},
				{
					columnDataKey: '14',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				},
				{
					columnDataKey: '15',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				},
				{
					columnDataKey: '16',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				},
				{
					columnDataKey: '17',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				},
				{
					columnDataKey: '18',
					cellTemplate: buttonCellTemplate,
                    headerCellTemplate: headerContentCellTemplate,
					cellFocusTargetCallback: this.getFocusTarget
				}
			];
		}
		this.periodicTableGrid.columnDefinitions = colDefs;
		this.periodicTableGrid.rowItemTemplate = customRowItemTemplate;
		this.periodicTableGrid.cellItemTemplate = customCellItemTemplate;
		this.periodicTableGrid.headerCellItemTemplate = headerCellTemplate;
        
		
	// 	this.periodicTableGrid.cellItemTemplate = html`
	// 	<fluent-data-grid-cell 
	// 		grid-column="${(x,c)=> c.index + 1}"
	// 		:rowData="${(x,c) => {console.log(x);console.log(c.parent.rowData); return c.parent.rowData;}}"
	// 		:columnDefinition="${x => x}"
	// 	>
		
	// </fluent-data-grid-cell>
	// 	`;
	}

	visibleChanged(oldValue:boolean, newValue:boolean){
		if (this.overlay != null){
			if (newValue){		
				
				this.periodicTableGrid.focus();
				//this.ownerDocument?.body?.appendChild(this.overlay);
				//let forceReflow = this.overlay.offsetHeight;
				//this.overlay.onclick = this.mousedown.bind(this);
				//this.overlay.classList.add('show');
				//this.mainModal.classList.add('show');
			
			}else{
				//this.ownerDocument?.body?.removeChild(this.overlay);
				//let forceReflow = this.overlay.offsetHeight;
				//this.overlay.onclick= null;
				//this.overlay.classList.remove('show');
				//this.mainModal.classList.remove('show');
			}
		}
	}

	getFocusTarget(cell: DataGridCell): HTMLElement {
		return cell.querySelector('element-button') as HTMLElement;
		//return cell.querySelector('chemical-element-button') as HTMLElement;
	  }

	mousedown(ev:Event){
		this.cancelClick();
	}

	cancelClick(){
		this.visible=false;
		this.$emit('dismiss');
	}
}
  