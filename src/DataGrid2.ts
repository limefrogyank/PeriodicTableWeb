import {
    eventFocus,
    eventFocusOut,
    eventKeyDown,
    keyArrowDown,
    keyArrowUp,
    keyEnd,
    keyHome,
    keyPageDown,
    keyPageUp,
} from "@microsoft/fast-web-utilities";
import {attr, ViewTemplate, observable, RepeatDirective, RepeatBehavior, DOM, css} from "@microsoft/fast-element";
import {DataGrid, dataGridTemplate as template, GenerateHeaderOptions,DataGridRowTypes, ColumnDefinition, FoundationElement } from "@microsoft/fast-foundation";
import { DataGridRow2 } from "./DataGridRow2";


const styles = css`
:host {
    display: flex;
    position: relative;
    flex-direction: column;
}
`; 

export class DataGrid2 extends FoundationElement {

    public static generateColumns = (row: object): ColumnDefinition[] => {
        return Object.getOwnPropertyNames(row).map((property: string, index: number) => {
            return {
                columnDataKey: property,
                gridColumn: `${index}`,
            };
        });
    };

    /**
     *  generates a gridTemplateColumns based on columndata array
     */
    private static generateTemplateColumns(
        columnDefinitions: ColumnDefinition[]
    ): string {
        let templateColumns: string = "";
        columnDefinitions.forEach((column: ColumnDefinition) => {
            templateColumns = `${templateColumns}${
                templateColumns === "" ? "" : " "
            }${"1fr"}`;
        });
        return templateColumns;
    }

    /**
     *  Whether the grid should automatically generate a header row and its type
     *
     * @public
     * @remarks
     * HTML Attribute: generate-header
     */
    @attr({ attribute: "generate-header" })
    public generateHeader: GenerateHeaderOptions = GenerateHeaderOptions.default;
    private generateHeaderChanged(): void {
        if (this.$fastController.isConnected) {
            this.toggleGeneratedHeader();
        }
    }

    /**
     * String that gets applied to the the css gridTemplateColumns attribute of child rows
     *
     * @public
     * @remarks
     * HTML Attribute: grid-template-columns
     */
    @attr({ attribute: "grid-template-columns" })
    public gridTemplateColumns: string;
    private gridTemplateColumnsChanged(): void {
        if (this.$fastController.isConnected) {
            this.updateRowIndexes();
        }
    }

    /**
     * The data being displayed in the grid
     *
     * @public
     */
    @observable
    public rowsData: object[] = [];
    private rowsDataChanged(): void {
        if (this.columnDefinitions === null && this.rowsData.length > 0) {
            this.columnDefinitions = DataGrid.generateColumns(this.rowsData[0]);
        }
    }

    /**
     * The column definitions of the grid
     *
     * @public
     */
    @observable
    public columnDefinitions: ColumnDefinition[] | null = null;
    private columnDefinitionsChanged(): void {
        if (this.columnDefinitions === null) {
            this.generatedGridTemplateColumns = "";
            return;
        }
        this.generatedGridTemplateColumns = DataGrid2.generateTemplateColumns(
            this.columnDefinitions
        );
        if (this.$fastController.isConnected) {
            this.columnDefinitionsStale = true;
            this.queueRowIndexUpdate();
        }
    }

    /**
     * The template to use for the programmatic generation of rows
     *
     * @public
     */
    @observable
    public rowItemTemplate: ViewTemplate;

    /**
     * The template used to render cells in generated rows.
     *
     * @public
     */
    @observable
    public cellItemTemplate?: ViewTemplate;

    /**
     * The template used to render header cells in generated rows.
     *
     * @public
     */
    @observable
    public headerCellItemTemplate?: ViewTemplate;
    private headerCellItemTemplateChanged(): void {
        if (this.$fastController.isConnected) {
            if (this.generatedHeader !== null) {
                this.generatedHeader.headerCellItemTemplate = this.headerCellItemTemplate;
            }
        }
    }

    /**
     * The index of the row that will receive focus the next time the
     * grid is focused. This value changes as focus moves to different
     * rows within the grid.  Changing this value when focus is already
     * within the grid moves focus to the specified row.
     *
     * @public
     */
    @observable
    public focusRowIndex: number = 0;
    private focusRowIndexChanged(): void {
        if (this.$fastController.isConnected) {
            this.queueFocusUpdate();
        }
    }

    /**
     * The index of the column that will receive focus the next time the
     * grid is focused. This value changes as focus moves to different rows
     * within the grid.  Changing this value when focus is already within
     * the grid moves focus to the specified column.
     *
     * @public
     */
    @observable
    public focusColumnIndex: number = 0;
    private focusColumnIndexChanged(): void {
        if (this.$fastController.isConnected) {
            this.queueFocusUpdate();
        }
    }

    /**
     * The default row item template.  Set by the component templates.
     *
     * @internal
     */
    @observable
    public defaultRowItemTemplate: ViewTemplate;

    /**
     * Set by the component templates.
     *
     */
    @observable
    public rowElementTag: string;

    /**
     * Children that are rows
     *
     * @internal
     */
    @observable
    public rowElements: HTMLElement[];

    private rowsRepeatBehavior: RepeatBehavior | null;
    private rowsPlaceholder: Node | null = null;

    private generatedHeader: DataGridRow2 | null = null;

    private isUpdatingFocus: boolean = false;
    private pendingFocusUpdate: boolean = false;

    private observer: MutationObserver;

    private rowindexUpdateQueued: boolean = false;
    private columnDefinitionsStale: boolean = true;

    private generatedGridTemplateColumns: string = "";

    constructor() {
        super();
    }

    /**
     * @internal
     */
    public connectedCallback(): void {
        super.connectedCallback();

        if (this.rowItemTemplate === undefined) {
            this.rowItemTemplate = this.defaultRowItemTemplate;
        }

        this.rowsPlaceholder = document.createComment("");
        this.appendChild(this.rowsPlaceholder);

        this.toggleGeneratedHeader();

        this.rowsRepeatBehavior = new RepeatDirective(
            x => x.rowsData,
            x => x.rowItemTemplate,
            { positioning: true }
        ).createBehavior(this.rowsPlaceholder);

        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
        this.$fastController.addBehaviors([this.rowsRepeatBehavior!]);

        this.addEventListener("row-focused", this.handleRowFocus);
        this.addEventListener(eventFocus, this.handleFocus);
        this.addEventListener(eventKeyDown, this.handleKeydown);
        this.addEventListener(eventFocusOut, this.handleFocusOut);

        this.observer = new MutationObserver(this.onChildListChange);
        // only observe if nodes are added or removed
        this.observer.observe(this, { childList: true });

        DOM.queueUpdate(this.queueRowIndexUpdate);
    }

    /**
     * @internal
     */
    public disconnectedCallback(): void {
        super.disconnectedCallback();

        this.removeEventListener("row-focused", this.handleRowFocus);
        this.removeEventListener(eventFocus, this.handleFocus);
        this.removeEventListener(eventKeyDown, this.handleKeydown);
        this.removeEventListener(eventFocusOut, this.handleFocusOut);

        // disconnect observer
        this.observer.disconnect();

        this.rowsPlaceholder = null;
        this.generatedHeader = null;
    }

    /**
     * @internal
     */
    public handleRowFocus(e: Event): void {
        this.isUpdatingFocus = true;
        const focusRow: DataGridRow2 = e.target as DataGridRow2;
        this.focusRowIndex = this.rowElements.indexOf(focusRow);
        this.focusColumnIndex = focusRow.focusColumnIndex;
        this.setAttribute("tabIndex", "-1");
        this.isUpdatingFocus = false;
    }

    /**
     * @internal
     */
    public handleFocus(e: FocusEvent): void {
        this.focusOnCell(this.focusRowIndex, this.focusColumnIndex, true);
    }

    /**
     * @internal
     */
    public handleFocusOut(e: FocusEvent): void {
        if (e.relatedTarget === null || !this.contains(e.relatedTarget as Element)) {
            this.setAttribute("tabIndex", "0");
        }
    }

    /**
     * @internal
     */
    public handleKeydown(e: KeyboardEvent): void {
        if (e.defaultPrevented) {
            return;
        }

        let newFocusRowIndex: number;
        const maxIndex = this.rowElements.length - 1;
        const currentGridBottom: number = this.offsetHeight + this.scrollTop;
        const lastRow: HTMLElement = this.rowElements[maxIndex] as HTMLElement;
        
        switch (e.key) {
            case keyArrowUp:
                e.preventDefault();
                // focus up one row if cell empty
                newFocusRowIndex = this.focusRowIndex - 1;
                while (this.rowElements[newFocusRowIndex].children[this.focusColumnIndex].childElementCount == 0 ){
                    newFocusRowIndex -= 1;
                    if (newFocusRowIndex == 0){
                        // there are no other cells that contain data.  Revert to original row.
                        newFocusRowIndex = this.focusRowIndex;
                        break;
                    }
                }
                this.focusOnCell(newFocusRowIndex, this.focusColumnIndex, true);
                break;

            case keyArrowDown:
                e.preventDefault();
                // focus down one row
                newFocusRowIndex = this.focusRowIndex + 1;
                while (this.rowElements[newFocusRowIndex].children[this.focusColumnIndex].childElementCount == 0 ){
                    newFocusRowIndex += 1;
                    if (newFocusRowIndex == this.rowElements.length - 1){
                        // there are no other cells that contain data.  Revert to original row.
                        newFocusRowIndex = this.focusRowIndex;
                        break;
                    }
                }
                this.focusOnCell(newFocusRowIndex, this.focusColumnIndex, true);
                break;

            case keyPageUp:
                e.preventDefault();
                newFocusRowIndex = 0;
                while (this.rowElements[newFocusRowIndex].children[this.focusColumnIndex].childElementCount == 0 ){
                    newFocusRowIndex += 1;
                    if (newFocusRowIndex == this.rowElements.length - 1){
                        // there are no other cells that contain data.  Revert to original row.
                        newFocusRowIndex = this.focusRowIndex;
                        break;
                    }
                }
                if (this.rowElements.length === 0) {
                    this.focusOnCell(newFocusRowIndex, 0, false);
                    break;
                }
                if (this.focusRowIndex === 0) {
                    this.focusOnCell(newFocusRowIndex, this.focusColumnIndex, false);
                    return;
                }

                //newFocusRowIndex = this.focusRowIndex - 1;
                let backup = newFocusRowIndex;
                for (newFocusRowIndex; newFocusRowIndex >= 0; newFocusRowIndex--) {
                    const thisRow: HTMLElement = this.rowElements[newFocusRowIndex];
                    if (thisRow.offsetTop < this.scrollTop) {
                        this.scrollTop =
                            thisRow.offsetTop + thisRow.clientHeight - this.clientHeight;
                        break;
                    }
                }

                this.focusOnCell(Math.max(backup,newFocusRowIndex), this.focusColumnIndex, false);
                break;

            case keyPageDown:
                e.preventDefault();
                newFocusRowIndex = this.rowElements.length - 1;
                while (this.rowElements[newFocusRowIndex].children[this.focusColumnIndex].childElementCount == 0 ){
                    newFocusRowIndex -= 1;
                    if (newFocusRowIndex == 0){
                        // there are no other cells that contain data.  Revert to original row.
                        newFocusRowIndex = this.focusRowIndex;
                        break;
                    }
                }

                if (this.rowElements.length === 0) {
                    this.focusOnCell(0, 0, false);
                    break;
                }

                // focus down one "page"
                if (
                    this.focusRowIndex >= newFocusRowIndex ||
                    lastRow.offsetTop + lastRow.offsetHeight <= currentGridBottom
                ) {
                    this.focusOnCell(newFocusRowIndex, this.focusColumnIndex, false);
                    return;
                }

                //newFocusRowIndex = this.focusRowIndex + 1;
                let backup2 = newFocusRowIndex;

                for (newFocusRowIndex; newFocusRowIndex <= maxIndex; newFocusRowIndex++) {
                    const thisRow: HTMLElement = this.rowElements[
                        newFocusRowIndex
                    ] as HTMLElement;
                    if (thisRow.offsetTop + thisRow.offsetHeight > currentGridBottom) {
                        let stickyHeaderOffset: number = 0;
                        if (
                            this.generateHeader === GenerateHeaderOptions.sticky &&
                            this.generatedHeader !== null
                        ) {
                            stickyHeaderOffset = this.generatedHeader.clientHeight;
                        }
                        this.scrollTop = thisRow.offsetTop - stickyHeaderOffset;
                        break;
                    }
                }

                this.focusOnCell(Math.min(backup,newFocusRowIndex), this.focusColumnIndex, false);

                break;

            case keyHome:
                if (e.ctrlKey) {
                    e.preventDefault();
                    // focus first cell of first row
                    this.focusOnCell(0, 0, true);
                }
                break;

            case keyEnd:
                if (e.ctrlKey && this.columnDefinitions !== null) {
                    e.preventDefault();
                    // focus last cell of last row
                    this.focusOnCell(
                        this.rowElements.length - 1,
                        this.columnDefinitions.length - 1,
                        true
                    );
                }
                break;
        }
    }

    private focusOnCell = (
        rowIndex: number,
        columnIndex: number,
        scrollIntoView: boolean
    ): void => {
        if (this.rowElements.length === 0) {
            this.focusRowIndex = 0;
            this.focusColumnIndex = 0;
            return;
        }

        const focusRowIndex = Math.max(
            0,
            Math.min(this.rowElements.length - 1, rowIndex)
        );
        const focusRow: Element = this.rowElements[focusRowIndex];

        const cells: NodeListOf<Element> = focusRow.querySelectorAll(
            '[role="cell"], [role="gridcell"], [role="columnheader"], [role="rowheader"]'
        );

        const focusColumnIndex = Math.max(0, Math.min(cells.length - 1, columnIndex));

        const focusTarget: HTMLElement = cells[focusColumnIndex] as HTMLElement;

        if (
            scrollIntoView &&
            this.scrollHeight !== this.clientHeight &&
            ((focusRowIndex < this.focusRowIndex && this.scrollTop > 0) ||
                (focusRowIndex > this.focusRowIndex &&
                    this.scrollTop < this.scrollHeight - this.clientHeight))
        ) {
            focusTarget.scrollIntoView({ block: "center", inline: "center" });
        }

        focusTarget.focus();
    };

    private queueFocusUpdate(): void {
        if (
            this.isUpdatingFocus &&
            (this.contains(document.activeElement) || this === document.activeElement)
        ) {
            return;
        }
        if (this.pendingFocusUpdate === false) {
            this.pendingFocusUpdate = true;
            DOM.queueUpdate(() => this.updateFocus());
        }
    }

    private updateFocus(): void {
        this.pendingFocusUpdate = false;
        this.focusOnCell(this.focusRowIndex, this.focusColumnIndex, true);
    }

    private toggleGeneratedHeader(): void {
        if (this.generatedHeader !== null) {
            this.removeChild(this.generatedHeader);
            this.generatedHeader = null;
        }

        if (this.generateHeader !== GenerateHeaderOptions.none) {
            const generatedHeaderElement: HTMLElement = document.createElement(
                this.rowElementTag
            );
            this.generatedHeader = (generatedHeaderElement as unknown) as DataGridRow2;
            this.generatedHeader.columnDefinitions = this.columnDefinitions;
            this.generatedHeader.gridTemplateColumns = this.gridTemplateColumns;
            this.generatedHeader.rowType =
                this.generateHeader === GenerateHeaderOptions.sticky
                    ? DataGridRowTypes.stickyHeader
                    : DataGridRowTypes.header;
            if (this.firstChild !== null || this.rowsPlaceholder !== null) {
                this.insertBefore(
                    generatedHeaderElement,
                    this.firstChild !== null ? this.firstChild : this.rowsPlaceholder
                );
            }
            return;
        }
    }

    private onChildListChange = (
        mutations: MutationRecord[],
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        observer: MutationObserver
    ): void => {
        if (mutations && mutations.length) {
            mutations.forEach((mutation: MutationRecord): void => {
                mutation.addedNodes.forEach((newNode: Node): void => {
                    if (
                        newNode.nodeType === 1 &&
                        (newNode as Element).getAttribute("role") === "row"
                    ) {
                        (newNode as DataGridRow2).columnDefinitions = this.columnDefinitions;
                    }
                });
            });

            this.queueRowIndexUpdate();
        }
    };

    private queueRowIndexUpdate = (): void => {
        if (!this.rowindexUpdateQueued) {
            this.rowindexUpdateQueued = true;
            DOM.queueUpdate(this.updateRowIndexes);
        }
    };

    private updateRowIndexes = (): void => {
        const newGridTemplateColumns =
            this.gridTemplateColumns === undefined
                ? this.generatedGridTemplateColumns
                : this.gridTemplateColumns;

        this.rowElements.forEach((element: Element, index: number): void => {
            const thisRow = element as DataGridRow2;
            thisRow.rowIndex = index;
            thisRow.gridTemplateColumns = newGridTemplateColumns;
            if (this.columnDefinitionsStale) {
                thisRow.columnDefinitions = this.columnDefinitions;
            }
        });

        this.rowindexUpdateQueued = false;
        this.columnDefinitionsStale = false;
    };
}
  
export const fastDataGrid2 = DataGrid2.compose({
    baseName: 'data-grid-2',
    template,
    styles,
    shadowOptions:{
      delegatesFocus:true
    }
  });
  