/*
<div>
    <h1 bind-text="title">
       <span bind-class="spanClass"></span>
    <h1>
    <p bind-text="description"></p>
    <div bind-if="showChild">
       child
       <div bind-if="showGrandChild"> Grand Child </div>
    </div>
</div>
 */


import { viewReaction } from '../reactivity/signal-ui-bound.js';

export function createMappedTemplateTest(template, store) {
    const element = document.createElement("template")
    element.innerHTML = template

    const trueElem = element.content.cloneNode(true)
    addBindings(trueElem, store)
    return trueElem
}

export function addBindings(element, store) {
    Array.from(element.querySelectorAll("[bind-text]")).forEach(child => {
        viewReaction(() => {
            child.textContent = store.getValue(child.getAttribute("bind-text"), child)
        })
    })

    Array.from(element.querySelectorAll("[bindClass]")).forEach(child => {
        const classAttributes = [];
        for(let attribute of child.attributes){
            if(attribute.name.startsWith('class.')){
                classAttributes.push(attribute);
            }
        }
        // console.log(classAttributes)
        classAttributes.forEach((attribute)=>{
            viewReaction(() => {
                const className = attribute.name.slice(6);
                const isEnabled = store.getValue(attribute.value, child);
                if(isEnabled){
                    child.classList.add(className)
                } else {
                    child.classList.remove(className)
                }
                // child.textContent = store.getValue(child.getAttribute("bind-text"), child)
            })
        })

    })

    // console.log('bindif', element, store);
    // console.log(element.querySelectorAll("[bind-if]"));
    Array.from(element.querySelectorAll("[bind-if]")).forEach(child =>
        bindIf(child, store)
    )
}

function bindIf(child, store) {
    const original = child.cloneNode(true)
    const parent = child.parentElement
    // console.log(child)
    const comment = new Comment()
    let ch = child
    viewReaction(() => {
        // console.log('bind if');
        const isShown =
            store.getValue(child.getAttribute("bind-if"), parent) == true;
        // console.log('is shown ', isShown);
        if (!isShown) {
            // console.log(1)
            parent.replaceChild(comment, ch)
            ch = null
        } else if (comment.parentElement) {
            ch = original.cloneNode(true)
            addBindings(ch, store)
            parent.replaceChild(ch, comment)
        }
    })
}
