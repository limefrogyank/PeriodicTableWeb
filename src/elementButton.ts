import {   Button} from '@microsoft/fast-foundation';
import {  buttonTemplate as template, ButtonOptions, ElementDefinitionContext} from '@microsoft/fast-foundation';
import { attr, customElement, css, cssPartial ,html, FASTElement} from '@microsoft/fast-element';




// const styles = (context: ElementDefinitionContext, definition: ButtonOptions) => css`
// 	${oldstyles(context,definition)}

//   :host {
//     min-width:30px;
//     height:30px;
//   }
  
// 	:host .control {
// 		padding:0px;
    
// 	}

// `;

export class ChemicalElementButton extends Button {
 
  public connectedCallback(): void {
    super.connectedCallback();
  }

}


export const chemicalElementButton = ChemicalElementButton.compose({
  baseName: 'element-button',
  
  baseClass: Button,
  template,
  // styles,
  shadowOptions:{
    delegatesFocus:true
  }
});

// export const chemicalElementButtonStyles = styles;

