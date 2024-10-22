function make(tag, content) {
    const parts = tag.split(".");
    const $e = document.createElement(parts[0]);
    for (let i = 1; i < parts.length; i++) {
        $e.classList.add(parts[i]);
    }
    if (content) {
        $e.append(content);
    }
    return $e;
}

async function loadData() {
    const resp = await fetch("data.json");
    const data = await resp.json();

    buildActionList(data.actions);
    buildActionTree(data.actions);
}

function buildActionList(actions) {
    const $actions = document.getElementById("action-list");
    const $table = make("table");
    const $head = make("thead");
    const $body = make("tbody");

    $table.append($head, $body);

    const $headerRow = make("tr");
    $headerRow.append(
        make("th", "Action Name"),
        make("th", "Inputs "),
        make("th", "Outputs"),
        make("th", "Requires"),
        make("th", "Unlocked By")
    );
    $head.append($headerRow);

    for (actionName in actions) {
        const action = actions[actionName];
        const $row = make("tr");

        const $name = make("span", action.name);
        const $input = action.input ? makeVerticalList(action.input) : null;
        const $output = action.output ? makeVerticalList(action.output) : null;
        const $required = action.required ? makeVerticalList(action.required) : null;
        const $unlock = action.unlockedBy ? makeVerticalList(action.unlockedBy) : null;

        $row.append(
            make("td", $name),
            make("td", $input),
            make("td", $output),
            make("td", $required),
            make("td", $unlock)
        );

        $body.append($row);
    }

    $actions.append($table);
}

function buildActionTree(actions) {
    const $treeDiv = document.getElementById("action-tree");
    $treeDiv.append(makeActionTreeNode(actions["Explore Surroundings"], null, null, actions));
}

function makeActionTreeNode(action, parentAction, requiredLevel, allActions) {
    const $node = make("div.vflex");
    const $children = make("div.children");

    const children = [];
    for (const a of Object.values(allActions)) {
        if (a.unlockedBy && action.name in a.unlockedBy) {
            children.push(a);
        }
    }
    children.sort((a, b) => a.unlockedBy[action.name] - b.unlockedBy[action.name]);

    for (const c of children) {
        $children.append(makeActionTreeNode(c, action, c.unlockedBy[action.name], allActions));
    }

    let nodeLabel = requiredLevel ? `${requiredLevel}: ${action.name}` : action.name;
    if (action.unlockedBy && Object.keys(action.unlockedBy).length > 1) {
        const alsoNeeded = Object.keys(action.unlockedBy).filter(name => name !== parentAction.name);
        nodeLabel += ` (also requires: ${alsoNeeded.map(name => `${name} ${action.unlockedBy[name]}`).join(", ")})`;
    }

    if (children.length > 0) {
        $node.append(makeExpander(nodeLabel, $children));
    } else {
        $node.append(make("span.non-expandable", nodeLabel));
    }

    $node.append($children);

    return $node;
}

function makeExpander(name, $target) {
    const $expander = make("div.expander");
    $expander.dataset.state = "expanded";
    const $icon = make("span.expander-icon", "-");
    const $name = make("span.expander-name", name);

    $expander.addEventListener("click", e => {
        if ($expander.dataset.state === "expanded") {
            $icon.innerText = "+";
            $target.classList.add("hidden");
            $expander.dataset.state = "collapsed";
        } else {
            $icon.innerText = "-";
            $target.classList.remove("hidden");
            $expander.dataset.state = "expanded";
        }
    });

    $expander.append($icon, $name);
    return $expander;
}

function makeVerticalList(items) {
    const $div = make("div.vflex");

    for (const name in items) {
        const num = items[name];
        $div.append(make("span", `${name}: ${num}`));
    }

    return $div;
}

let $activeTab = document.querySelector(".tab.active");

function attachTabEvents() {
    for (const $tab of document.querySelectorAll(".tab")) {
        $tab.addEventListener("click", e => {
            $activeTab.classList.remove("active");
            const $prevTabContent = document.getElementById($activeTab.dataset.target);
            $prevTabContent.classList.add("hidden");
            e.target.classList.add("active");
            const $newTabContent = document.getElementById(e.target.dataset.target);
            $newTabContent.classList.remove("hidden");
            $activeTab = e.target;
        });
    }
}

attachTabEvents();
loadData();
