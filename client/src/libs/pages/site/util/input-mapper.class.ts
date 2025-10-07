import { Observable } from '../../../web-utils/reactivity/observable';
import { DeleteEvent, InsertEvent } from '../../../core/utils/input-sampler/input-sampler.class.ts';

export class InputMapper {

  events$ = new Observable();

  constructor(
    input: HTMLInputElement,
  ) {

    let prevValue: string | null = null;

    let prevSelection: [number, number] | any = null;
    input.onbeforeinput = () => {
      prevSelection = [input.selectionStart, input.selectionEnd];
      prevValue = input.value;
    };

    (input!.oninput as any) = (event: InputEvent) => {
      const currentSelection = [input.selectionStart, input.selectionEnd];
      if (event.inputType === 'insertText') {
        this.events$.next(new InsertEvent(prevSelection[0]!, event.data!));
      }

      if (event.inputType === 'deleteContentBackward') {
        this.events$.next(new DeleteEvent(currentSelection[0]!, prevSelection[1]! - currentSelection[1]!, prevValue!.substring(prevSelection[1]!, currentSelection[1]!)));
      }

      if (event.inputType === 'deleteWordBackward') {
        this.events$.next(new DeleteEvent(currentSelection[0]!, prevSelection[1]! - currentSelection[1]!, prevValue!.substring(prevSelection[1]!, currentSelection[1]!)));
      }

      if (event.inputType === 'insertFromPaste') {

      }

      if (event.inputType === 'insertReplacementText') {

      }
    };

    input.onblur = () => {
      this.events$.next(null);
    };
  }
}
