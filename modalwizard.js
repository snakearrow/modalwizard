class Modal {
    constructor(modal_html_elem) {
        this.pages = [];
        this.current_page = 0;
        this.elem = modal_html_elem;
    }

    add_page(page) {
        this.pages.push(page);
    }

    next_clicked() {
        if (this.current_page < this.pages.length - 1) {
            let old_page = this.current_page;
            let new_page = ++this.current_page;
            if (typeof this.pages[old_page].validation_callback == "function") {
                if (!this.pages[old_page].validation_callback()) {
                    console.log("validation failed");
                    this.current_page--;
                    return;
                }
            }
            this.pages[old_page].hide();
            this.pages[new_page].show();
        }
    }

    back_clicked() {
        if (this.current_page > 0) {
            let old_page = this.current_page;
            let new_page = --this.current_page;
            this.pages[old_page].hide();
            this.pages[new_page].show();
        }
    }

    finish_clicked() {
        this.close();
        // gather data from input forms
        let data = {};
        for (let page of this.pages) {
            let input_values = page.input_values;
            data[page.elem.id] = input_values;
        }
        if (this.finish_callback) {
            this.finish_callback(data);
        }
    }

    close() {
        this.reset();
        this.elem.style.display = "none";
    }

    show() {
        this.elem.style.display = "block";
        // show first page
        if (this.pages[0]) {
            this.pages[0].show();
        }
    }

    reset() {
        this.current_page = 0;
        for (let page of this.pages) {
            page.hide();
            page.clear();
        }
    }
}

class Page {
    constructor(idx, page_html_element) {
        this.index = idx;
        this.next_btn = null;
        this.back_btn = null;
        this.finish_btn = null;
        this.close_btn = null;
        this.elem = page_html_element;
        this.inputs = {};
        this.input_values = {};

        this.get_inputs();
    }

    get_inputs() {
        let inputs = this.elem.getElementsByTagName("input");
        for (let input of inputs) {
            this.inputs[input.id] = input;
            this.input_values[input.id] = null;
        }
    }

    clear() {
        for (let input in this.inputs) {
            this.inputs[input].value = "";
        }
    }

    show() {
        this.elem.style.display = "block";
    }

    hide() {
        this.save_input_values();
        this.elem.style.display = "none";
    }

    save_input_values() {
        for (let key in this.inputs) {
            let input = this.inputs[key];
            if (input.type === "text" || input.type === "password" || input.type === "email" || input.type === "number") {
                this.input_values[input.id] = input.value;
            } else if (input.type === "checkbox" || input.type === "radio") {
                this.input_values[input.id] = input.checked;
            }
        }
    }
}

// returns a dictionary with modal names as keys and modal objects as values
function initModals(args) {
    let modals = new Object();
    for (let modal of args) {
        let modal_id = document.getElementById(modal);
        if (modal_id === null) {
            printerr("modal " + modal + " not found, skipping");
        } else {
            let modal_obj = initModal(modal);
            modals[modal] = modal_obj;
        }
    }
    return modals;
}

function initModal(modal) {
    print("init modal " + modal);
    let modal_id = document.getElementById(modal);
    let modal_obj = new Modal(modal_id);

    // get open modal button for this modal
    let modal_btn_open = document.getElementById(modal + "_btn_open");
    modal_btn_open.onclick = function () {
        modal_obj.show();
    };

    // get pages and hide all but the first one
    let idx = 1;
    while (true) {
        let page_name = modal + "_page" + idx;
        let page_id = document.getElementById(page_name);
        if (page_id === null) {
            break;
        }
        if (idx > 1) {
            page_id.style.display = "none";
        }
        let page = new Page(idx, page_id);
        modal_obj.add_page(page);
        idx++;
    }
    let n_pages = idx - 1;
    print("pages for modal " + modal + " found: " + n_pages);

    // get buttons
    for (let i = 1; i < n_pages + 1; i++) {
        let next_btn = document.getElementById(modal + "_page" + i + "_btn_next");
        modal_obj.pages[i - 1].next_btn = next_btn;
        if (next_btn) {
            next_btn.onclick = function () {
                modal_obj.next_clicked();
            };
        }

        let back_btn = document.getElementById(modal + "_page" + i + "_btn_back");
        modal_obj.pages[i - 1].back_btn = back_btn;
        if (back_btn) {
            back_btn.onclick = function () {
                modal_obj.back_clicked();
            };
        }

        let finish_btn = document.getElementById(modal + "_page" + i + "_btn_finish");
        modal_obj.pages[i - 1].finish_btn = finish_btn;
        if (finish_btn) {
            finish_btn.onclick = function () {
                modal_obj.finish_clicked();
            };
        }

        let close_btn = document.getElementById(modal + "_page" + i + "_btn_close");
        modal_obj.pages[i - 1].close_btn = close_btn;
        if (close_btn) {
            close_btn.onclick = function () {
                modal_obj.close();
            };
        }
    }
    return modal_obj;
}

function print(a) {
    console.log("modalwizard.js info: " + a);
}

function printerr(a) {
    console.error("modalwizard.js ERR: " + a);
}
