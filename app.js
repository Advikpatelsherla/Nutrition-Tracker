/* =========================================
   STORAGE
========================================= */

const FOOD_STORAGE =
    "nutritionTrackerFoods";

const LOG_STORAGE =
    "nutritionTrackerLogs";

const SUPPLEMENT_STORAGE =
    "nutritionTrackerSupplements";

const WEIGHT_STORAGE =
    "nutritionTrackerWeights";


/* =========================================
   DATA
========================================= */

let foods =
    JSON.parse(
        localStorage.getItem(
            FOOD_STORAGE
        )
    ) || [];


let logs =
    JSON.parse(
        localStorage.getItem(
            LOG_STORAGE
        )
    ) || [];


let supplementLogs =
    JSON.parse(
        localStorage.getItem(
            SUPPLEMENT_STORAGE
        )
    ) || {};


let weightLogs =
    JSON.parse(
        localStorage.getItem(
            WEIGHT_STORAGE
        )
    ) || [];


let selectedCategory =
    "protein";


let editingFoodId =
    null;


let editingWeightId =
    null;


let weightChart =
    null;


const meals = [
    "Breakfast",
    "Lunch",
    "Dinner"
];


const normalGramOptions = [

    "10 g",
    "20 g",
    "30 g",
    "40 g",
    "50 g",
    "60 g",
    "75 g",
    "80 g",
    "100 g",
    "120 g",
    "150 g",
    "200 g",
    "250 g",
    "300 g"

];


/* =========================================
   HELPER
========================================= */

function getElement(id) {

    return document.getElementById(id);

}


function saveStorage() {

    localStorage.setItem(
        FOOD_STORAGE,
        JSON.stringify(foods)
    );


    localStorage.setItem(
        LOG_STORAGE,
        JSON.stringify(logs)
    );


    localStorage.setItem(
        SUPPLEMENT_STORAGE,
        JSON.stringify(
            supplementLogs
        )
    );


    localStorage.setItem(
        WEIGHT_STORAGE,
        JSON.stringify(
            weightLogs
        )
    );

}


/* =========================================
   DATE
========================================= */

const today =
    new Date()
        .toISOString()
        .split("T")[0];


getElement(
    "logDate"
).value = today;


getElement(
    "fromDate"
).value = today;


getElement(
    "toDate"
).value = today;


getElement(
    "weightDate"
).value = today;


/* =========================================
   NAVIGATION
========================================= */

document
    .querySelectorAll(".tab")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                document
                    .querySelectorAll(
                        ".tab"
                    )
                    .forEach(tab => {

                        tab.classList.remove(
                            "active"
                        );

                    });


                document
                    .querySelectorAll(
                        ".page"
                    )
                    .forEach(page => {

                        page.classList.remove(
                            "active"
                        );

                    });


                button.classList.add(
                    "active"
                );


                getElement(
                    button.dataset.page
                ).classList.add(
                    "active"
                );


                if (
                    button.dataset.page ===
                    "progressPage"
                ) {

                    renderHistory();

                }


                if (
                    button.dataset.page ===
                    "weightPage"
                ) {

                    renderWeightPage();

                }


                if (
                    button.dataset.page ===
                    "foodsPage"
                ) {

                    renderFoodList();

                }

            }

        );

    });


/* =========================================
   MEAL SECTIONS
========================================= */

function renderMeals() {

    const container =
        getElement(
            "mealSections"
        );


    container.innerHTML =
        "";


    meals.forEach(meal => {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "card meal-card";


        card.dataset.meal =
            meal;


        card.innerHTML = `

            <h2>${meal}</h2>

            <div class="rows"></div>

            <button
                class="add-btn"
                type="button">

                + Add Food

            </button>

        `;


        container.appendChild(
            card
        );


        card
            .querySelector(
                ".add-btn"
            )
            .addEventListener(
                "click",
                function () {

                    addFoodRow(
                        card
                    );

                }
            );


        const savedRows =
            logs.filter(
                item =>

                    item.date ===
                    getElement(
                        "logDate"
                    ).value &&

                    item.meal ===
                    meal

            );


        if (
            savedRows.length > 0
        ) {

            savedRows.forEach(
                item => {

                    addFoodRow(
                        card,
                        item
                    );

                }
            );

        }

        else {

            addFoodRow(
                card
            );

        }

    });

}


/* =========================================
   CREATE FOOD ROW
========================================= */

function addFoodRow(
    mealCard,
    savedItem = null
) {

    const row =
        document.createElement(
            "div"
        );


    row.className =
        "food-row";


    const foodSelect =
        document.createElement(
            "select"
        );


    foodSelect.innerHTML = `

        <option value="">
            Select Food
        </option>

    `;


    foods
        .filter(
            food =>
                food.category !==
                "supplement"
        )
        .forEach(
            food => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    food.name;


                option.textContent =
                    food.name;


                foodSelect.appendChild(
                    option
                );

            }
        );


    const amountContainer =
        document.createElement(
            "div"
        );


    amountContainer.className =
        "amount-buttons";


    const removeButton =
        document.createElement(
            "button"
        );


    removeButton.type =
        "button";


    removeButton.className =
        "remove-btn";


    removeButton.textContent =
        "×";


    row.appendChild(
        foodSelect
    );


    row.appendChild(
        amountContainer
    );


    row.appendChild(
        removeButton
    );


    mealCard
        .querySelector(
            ".rows"
        )
        .appendChild(
            row
        );


    function createAmountButton(
        text
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "amount-btn";


        button.textContent =
            text;


        button.addEventListener(
            "click",
            function () {

                row.dataset.amount =
                    text;


                amountContainer
                    .querySelectorAll(
                        ".amount-btn"
                    )
                    .forEach(
                        btn => {

                            btn.classList
                                .remove(
                                    "selected"
                                );

                        }
                    );


                button.classList.add(
                    "selected"
                );


                calculateTotals();

            }
        );


        amountContainer.appendChild(
            button
        );

    }


    function renderAmountButtons() {

        amountContainer.innerHTML =
            "";


        const food =
            foods.find(
                item =>
                    item.name ===
                    foodSelect.value
            );


        if (
            food &&
            food.servingOptions &&
            food.servingOptions.length > 0
        ) {

            food.servingOptions
                .forEach(
                    option => {

                        createAmountButton(
                            option
                        );

                    }
                );

        }

        else {

            normalGramOptions
                .forEach(
                    option => {

                        createAmountButton(
                            option
                        );

                    }
                );


            const customButton =
                document.createElement(
                    "button"
                );


            customButton.type =
                "button";


            customButton.className =
                "amount-btn";


            customButton.textContent =
                "Custom";


            customButton.addEventListener(
                "click",
                function () {

                    const grams =
                        prompt(
                            "Enter quantity in grams:"
                        );


                    if (
                        grams &&
                        Number(
                            grams
                        ) > 0
                    ) {

                        const value =
                            Number(
                                grams
                            ) +
                            " g";


                        row.dataset.amount =
                            value;


                        amountContainer
                            .querySelectorAll(
                                ".amount-btn"
                            )
                            .forEach(
                                btn => {

                                    btn.classList
                                        .remove(
                                            "selected"
                                        );

                                }
                            );


                        customButton.textContent =
                            value;


                        customButton.classList
                            .add(
                                "selected"
                            );


                        calculateTotals();

                    }

                }
            );


            amountContainer.appendChild(
                customButton
            );

        }

    }


    foodSelect.addEventListener(
        "change",
        function () {

            row.dataset.food =
                foodSelect.value;


            row.dataset.amount =
                "";


            renderAmountButtons();


            calculateTotals();

        }
    );


    removeButton.addEventListener(
        "click",
        function () {

            row.remove();

            calculateTotals();

        }
    );


    if (
        savedItem
    ) {

        foodSelect.value =
            savedItem.food;


        row.dataset.food =
            savedItem.food;


        renderAmountButtons();


        const matchingButton =
            [
                ...
                amountContainer
                    .querySelectorAll(
                        ".amount-btn"
                    )
            ]
            .find(
                button =>
                    button.textContent ===
                    savedItem.amount
            );


        if (
            matchingButton
        ) {

            matchingButton.click();

        }

    }

}


/* =========================================
   QUANTITY TO GRAMS
========================================= */

function getQuantityInGrams(
    amount,
    food
) {

    if (!amount) {

        return 0;

    }


    const number =
        parseFloat(
            amount
        );


    if (
        amount.endsWith(
            " g"
        )
    ) {

        return number;

    }


    if (
        amount.includes(
            "scoop"
        ) ||
        amount.includes(
            "capsule"
        )
    ) {

        return (

            number *

            Number(
                food.servingWeight ||
                0
            )

        );

    }


    return 0;

}


/* =========================================
   NUTRITION
========================================= */

function getNutrition(
    foodName,
    amount
) {

    const food =
        foods.find(
            item =>
                item.name ===
                foodName
        );


    if (!food) {

        return null;

    }


    const grams =
        getQuantityInGrams(
            amount,
            food
        );


    if (!grams) {

        return null;

    }


    const multiplier =
        grams / 100;


    return {

        calories:
            food.calories *
            multiplier,

        protein:
            food.protein *
            multiplier,

        carbs:
            food.carbs *
            multiplier,

        fat:
            food.fat *
            multiplier,

        fibre:
            food.fibre *
            multiplier

    };

}


/* =========================================
   DAILY TOTALS
========================================= */

function calculateTotals() {

    const total = {

        calories: 0,

        protein: 0,

        carbs: 0,

        fat: 0,

        fibre: 0

    };


    document
        .querySelectorAll(
            ".meal-card"
        )
        .forEach(
            card => {

                card
                    .querySelectorAll(
                        ".food-row"
                    )
                    .forEach(
                        row => {

                            const nutrition =
                                getNutrition(
                                    row.dataset.food,
                                    row.dataset.amount
                                );


                            if (
                                nutrition
                            ) {

                                total.calories +=
                                    nutrition.calories;

                                total.protein +=
                                    nutrition.protein;

                                total.carbs +=
                                    nutrition.carbs;

                                total.fat +=
                                    nutrition.fat;

                                total.fibre +=
                                    nutrition.fibre;

                            }

                        }
                    );

            }
        );


    getElement(
        "totalCalories"
    ).textContent =
        total.calories.toFixed(
            0
        );


    getElement(
        "totalProtein"
    ).textContent =
        total.protein.toFixed(
            1
        );


    getElement(
        "totalCarbs"
    ).textContent =
        total.carbs.toFixed(
            1
        );


    getElement(
        "totalFat"
    ).textContent =
        total.fat.toFixed(
            1
        );


    getElement(
        "totalFibre"
    ).textContent =
        total.fibre.toFixed(
            1
        );


    return total;

}


/* =========================================
   SUPPLEMENTS
========================================= */

function renderSupplements() {

    const container =
        getElement(
            "supplementChecklist"
        );


    const date =
        getElement(
            "logDate"
        ).value;


    const saved =
        supplementLogs[
            date
        ] || {};


    container.innerHTML =
        "";


    const supplements = [

        "Protein",

        "Omega-3 / Fish Oil",

        "Creatine"

    ];


    supplements.forEach(
        name => {

            const label =
                document.createElement(
                    "label"
                );


            label.className =
                "check-item";


            const checkbox =
                document.createElement(
                    "input"
                );


            checkbox.type =
                "checkbox";


            checkbox.checked =
                saved[name] ===
                true;


            checkbox.addEventListener(
                "change",
                function () {

                    if (
                        !supplementLogs[
                            date
                        ]
                    ) {

                        supplementLogs[
                            date
                        ] = {};

                    }


                    supplementLogs[
                        date
                    ][name] =
                        checkbox.checked;


                    saveStorage();

                }
            );


            label.appendChild(
                checkbox
            );


            label.appendChild(
                document.createTextNode(
                    name
                )
            );


            container.appendChild(
                label
            );

        }
    );

}


/* =========================================
   CHANGE FOOD DATE
========================================= */

getElement(
    "logDate"
).addEventListener(
    "change",
    function () {

        renderMeals();

        renderSupplements();

        calculateTotals();

    }
);


/* =========================================
   SAVE FOOD DAY
========================================= */

getElement(
    "saveDayBtn"
).addEventListener(
    "click",
    function () {

        const date =
            getElement(
                "logDate"
            ).value;


        logs =
            logs.filter(
                item =>
                    item.date !==
                    date
            );


        document
            .querySelectorAll(
                ".meal-card"
            )
            .forEach(
                card => {

                    const meal =
                        card.dataset.meal;


                    card
                        .querySelectorAll(
                            ".food-row"
                        )
                        .forEach(
                            row => {

                                if (
                                    row.dataset.food &&
                                    row.dataset.amount
                                ) {

                                    logs.push({

                                        date:
                                            date,

                                        meal:
                                            meal,

                                        food:
                                            row.dataset.food,

                                        amount:
                                            row.dataset.amount

                                    });

                                }

                            }
                        );

                }
            );


        saveStorage();


        getElement(
            "saveMessage"
        ).textContent =
            "Day saved successfully.";


        setTimeout(
            function () {

                getElement(
                    "saveMessage"
                ).textContent =
                    "";

            },
            2000
        );

    }
);


/* =========================================
   NUTRITION PROGRESS
========================================= */

function renderHistory() {

    const from =
        getElement(
            "fromDate"
        ).value;


    const to =
        getElement(
            "toDate"
        ).value;


    const dates = [

        ...
        new Set(

            logs
                .map(
                    item =>
                        item.date
                )
                .filter(
                    date =>
                        date >= from &&
                        date <= to
                )

        )

    ]
        .sort()
        .reverse();


    const history =
        getElement(
            "historyList"
        );


    history.innerHTML =
        "";


    if (
        dates.length === 0
    ) {

        history.innerHTML = `

            <p class="muted">

                No saved days in
                this date range.

            </p>

        `;


        updateAverages(
            []
        );


        return;

    }


    const dailyTotals = [];


    dates.forEach(
        date => {

            const total = {

                calories: 0,

                protein: 0,

                carbs: 0,

                fat: 0,

                fibre: 0

            };


            logs
                .filter(
                    item =>
                        item.date ===
                        date
                )
                .forEach(
                    item => {

                        const nutrition =
                            getNutrition(
                                item.food,
                                item.amount
                            );


                        if (
                            nutrition
                        ) {

                            total.calories +=
                                nutrition.calories;

                            total.protein +=
                                nutrition.protein;

                            total.carbs +=
                                nutrition.carbs;

                            total.fat +=
                                nutrition.fat;

                            total.fibre +=
                                nutrition.fibre;

                        }

                    }
                );


            dailyTotals.push(
                total
            );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "history-row";


            row.innerHTML = `

                <strong>
                    ${date}
                </strong>

                <br>

                <span class="muted">

                    ${total.calories.toFixed(0)}
                    kcal ·

                    ${total.protein.toFixed(1)}
                    g protein ·

                    ${total.fibre.toFixed(1)}
                    g fibre

                </span>

            `;


            row.addEventListener(
                "click",
                function () {

                    getElement(
                        "logDate"
                    ).value =
                        date;


                    document
                        .querySelector(
                            '[data-page="dailyPage"]'
                        )
                        .click();


                    renderMeals();

                    renderSupplements();

                    calculateTotals();

                }
            );


            history.appendChild(
                row
            );

        }
    );


    updateAverages(
        dailyTotals
    );

}


function updateAverages(
    days
) {

    function average(
        property
    ) {

        if (
            days.length ===
            0
        ) {

            return 0;

        }


        return (

            days.reduce(
                (
                    sum,
                    day
                ) =>
                    sum +
                    day[property],
                0
            )

            /

            days.length

        );

    }


    getElement(
        "avgCalories"
    ).textContent =
        average(
            "calories"
        ).toFixed(
            0
        );


    getElement(
        "avgProtein"
    ).textContent =
        average(
            "protein"
        ).toFixed(
            1
        );


    getElement(
        "avgCarbs"
    ).textContent =
        average(
            "carbs"
        ).toFixed(
            1
        );


    getElement(
        "avgFat"
    ).textContent =
        average(
            "fat"
        ).toFixed(
            1
        );


    getElement(
        "avgFibre"
    ).textContent =
        average(
            "fibre"
        ).toFixed(
            1
        );

}


getElement(
    "fromDate"
).addEventListener(
    "change",
    renderHistory
);


getElement(
    "toDate"
).addEventListener(
    "change",
    renderHistory
);


/* =========================================
   FOOD CATEGORY
========================================= */

document
    .querySelectorAll(
        ".category-btn"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    document
                        .querySelectorAll(
                            ".category-btn"
                        )
                        .forEach(
                            btn => {

                                btn.classList
                                    .remove(
                                        "active"
                                    );

                            }
                        );


                    button.classList.add(
                        "active"
                    );


                    selectedCategory =
                        button.dataset.category;
                    renderFoodList();

                    if (
                        selectedCategory ===
                        "protein"
                    ) {

                        getElement(
                            "formTitle"
                        ).textContent =
                            "Add Protein Powder";


                        getElement(
                            "servingOptionsBox"
                        ).style.display =
                            "block";

                    }

                    else if (
                        selectedCategory ===
                        "food"
                    ) {

                        getElement(
                            "formTitle"
                        ).textContent =
                            "Add Food Item";


                        getElement(
                            "servingOptionsBox"
                        ).style.display =
                            "none";

                    }

                    else {

                        getElement(
                            "formTitle"
                        ).textContent =
                            "Add Dish";


                        getElement(
                            "servingOptionsBox"
                        ).style.display =
                            "none";

                    }

                }
            );

        }
    );


/* =========================================
   ADD / UPDATE FOOD
========================================= */

getElement(
    "foodForm"
).addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const name =
            getElement(
                "foodName"
            ).value.trim();


        const duplicate =
            foods.some(
                food =>

                    food.id !==
                    editingFoodId &&

                    food.name
                        .toLowerCase() ===
                    name.toLowerCase()

            );


        if (
            duplicate
        ) {

            alert(
                "This food already exists."
            );

            return;

        }


        const servingOptions =

            selectedCategory ===
            "protein"

                ?

            [

                ...
                document
                    .querySelectorAll(
                        "#servingOptionsBox input[type='checkbox']:checked"
                    )

            ]
            .map(
                checkbox =>
                    checkbox.value
            )

                :

            [];


        const foodData = {

            name:
                name,

            category:
                selectedCategory,

            calories:
                Number(
                    getElement(
                        "calories"
                    ).value
                ),

            protein:
                Number(
                    getElement(
                        "protein"
                    ).value
                ),

            carbs:
                Number(
                    getElement(
                        "carbs"
                    ).value
                ),

            fat:
                Number(
                    getElement(
                        "fat"
                    ).value
                ),

            fibre:
                Number(
                    getElement(
                        "fibre"
                    ).value ||
                    0
                ),

            sugar:
                Number(
                    getElement(
                        "sugar"
                    ).value ||
                    0
                ),

            servingOptions:
                servingOptions,

            servingWeight:
                Number(
                    getElement(
                        "servingWeight"
                    ).value ||
                    0
                )

        };


        if (
            editingFoodId !==
            null
        ) {

            const index =
                foods.findIndex(
                    food =>
                        food.id ===
                        editingFoodId
                );


            if (
                index !== -1
            ) {

                foods[index] = {

                    ...foods[index],

                    ...foodData

                };

            }


            alert(
                name +
                " updated successfully."
            );

        }

        else {

            foods.push({

                id:
                    Date.now(),

                ...foodData

            });


            alert(
                name +
                " added successfully."
            );

        }


        saveStorage();


        editingFoodId =
            null;


        this.reset();


        selectedCategory =
            "protein";


        document
            .querySelectorAll(
                ".category-btn"
            )
            .forEach(
                button => {

                    button.classList
                        .remove(
                            "active"
                        );


                    if (
                        button.dataset.category ===
                        "protein"
                    ) {

                        button.classList.add(
                            "active"
                        );

                    }

                }
            );


        getElement(
            "formTitle"
        ).textContent =
            "Add Protein Powder";


        getElement(
            "servingOptionsBox"
        ).style.display =
            "block";


        getElement(
            "foodForm"
        )
            .querySelector(
                ".primary-btn"
            )
            .textContent =
            "ADD TO MY FOODS";


        renderFoodList();

        renderMeals();

    }
);

/* =========================================
   FOOD LIST
========================================= */

function renderFoodList() {

    const list = getElement("foodList");

    list.innerHTML = "";

    const filteredFoods = foods.filter(
        food => food.category === selectedCategory
    );

    if (filteredFoods.length === 0) {

        const categoryName =
            selectedCategory === "protein"
                ? "protein powders"
                : selectedCategory === "food"
                    ? "food items"
                    : "dishes";

        list.innerHTML = `
            <p class="muted">
                No ${categoryName} added yet.
            </p>
        `;

        return;
    }

    filteredFoods.forEach(food => {

        const item = document.createElement("div");
        item.className = "food-item";

        const information = document.createElement("div");

        information.innerHTML = `
            <strong>${food.name}</strong>

            <div class="food-meta">
                ${food.calories} kcal / 100 g
                ·
                ${food.protein} g protein / 100 g
            </div>
        `;

        const buttons = document.createElement("div");
        buttons.className = "food-actions";

        const editButton = document.createElement("button");
        editButton.className = "edit-food";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", function () {
            startEditingFood(food);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-food";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {

            if (confirm("Delete " + food.name + "?")) {

                foods = foods.filter(
                    item => item.id !== food.id
                );

                saveStorage();
                renderFoodList();
                renderMeals();
            }

        });

        buttons.appendChild(editButton);
        buttons.appendChild(deleteButton);

        item.appendChild(information);
        item.appendChild(buttons);

        list.appendChild(item);

    });

}

/* =========================================
   EDIT FOOD
========================================= */

function startEditingFood(
    food
) {

    editingFoodId =
        food.id;


    selectedCategory =
        food.category;


    document
        .querySelectorAll(
            ".category-btn"
        )
        .forEach(
            button => {

                button.classList
                    .remove(
                        "active"
                    );


                if (
                    button.dataset.category ===
                    food.category
                ) {

                    button.classList.add(
                        "active"
                    );

                }

            }
        );


    if (
        food.category ===
        "protein"
    ) {

        getElement(
            "formTitle"
        ).textContent =
            "Edit Protein Powder";


        getElement(
            "servingOptionsBox"
        ).style.display =
            "block";

    }

    else if (
        food.category ===
        "food"
    ) {

        getElement(
            "formTitle"
        ).textContent =
            "Edit Food Item";


        getElement(
            "servingOptionsBox"
        ).style.display =
            "none";

    }

    else {

        getElement(
            "formTitle"
        ).textContent =
            "Edit Dish";


        getElement(
            "servingOptionsBox"
        ).style.display =
            "none";

    }


    getElement(
        "foodName"
    ).value =
        food.name;


    getElement(
        "calories"
    ).value =
        food.calories;


    getElement(
        "protein"
    ).value =
        food.protein;


    getElement(
        "carbs"
    ).value =
        food.carbs;


    getElement(
        "fat"
    ).value =
        food.fat;


    getElement(
        "fibre"
    ).value =
        food.fibre;


    getElement(
        "sugar"
    ).value =
        food.sugar;


    getElement(
        "servingWeight"
    ).value =
        food.servingWeight ||
        "";


    document
        .querySelectorAll(
            "#servingOptionsBox input[type='checkbox']"
        )
        .forEach(
            checkbox => {

                checkbox.checked =
                    food
                        .servingOptions
                        ?.includes(
                            checkbox.value
                        ) ||
                    false;

            }
        );


    getElement(
        "foodForm"
    )
        .querySelector(
            ".primary-btn"
        )
        .textContent =
        "UPDATE FOOD";


    getElement(
        "foodForm"
    ).scrollIntoView({

        behavior:
            "smooth",

        block:
            "start"

    });

}


/* =========================================
   WEIGHT PAGE
========================================= */

function renderWeightPage() {

    renderWeightHistory();

    updateWeightSummary();

    drawWeightChart();

}


/* =========================================
   SAVE WEIGHT
========================================= */

getElement(
    "saveWeightBtn"
).addEventListener(
    "click",
    function () {

        const date =
            getElement(
                "weightDate"
            ).value;


        const value =
            Number(
                getElement(
                    "weightValue"
                ).value
            );


        if (
            !date
        ) {

            alert(
                "Please select a date."
            );

            return;

        }


        if (
            !value ||
            value <= 0
        ) {

            alert(
                "Please enter a valid weight."
            );

            return;

        }


        /*
          If editing an existing record,
          update that record.
        */

        if (
            editingWeightId !==
            null
        ) {

            const index =
                weightLogs.findIndex(
                    item =>
                        item.id ===
                        editingWeightId
                );


            if (
                index !== -1
            ) {

                weightLogs[index] = {

                    id:
                        editingWeightId,

                    date:
                        date,

                    weight:
                        value

                };

            }


            editingWeightId =
                null;


            getElement(
                "weightMessage"
            ).textContent =
                "Weight updated successfully.";

        }

        else {

            /*
              If a weight already exists
              on the same date, update it
              instead of creating duplicates.
            */

            const existing =
                weightLogs.find(
                    item =>
                        item.date ===
                        date
                );


            if (
                existing
            ) {

                existing.weight =
                    value;

            }

            else {

                weightLogs.push({

                    id:
                        Date.now(),

                    date:
                        date,

                    weight:
                        value

                });

            }


            getElement(
                "weightMessage"
            ).textContent =
                "Weight saved successfully.";

        }


        saveStorage();


        resetWeightForm();


        renderWeightPage();


        setTimeout(
            function () {

                getElement(
                    "weightMessage"
                ).textContent =
                    "";

            },
            2000
        );

    }
);


/* =========================================
   RESET WEIGHT FORM
========================================= */

function resetWeightForm() {

    editingWeightId =
        null;


    getElement(
        "weightValue"
    ).value =
        "";


    getElement(
        "weightDate"
    ).value =
        today;


    getElement(
        "saveWeightBtn"
    ).textContent =
        "SAVE WEIGHT";


    getElement(
        "cancelWeightEditBtn"
    ).style.display =
        "none";

}


/* =========================================
   CANCEL WEIGHT EDIT
========================================= */

getElement(
    "cancelWeightEditBtn"
).addEventListener(
    "click",
    function () {

        resetWeightForm();

    }
);


/* =========================================
   EDIT WEIGHT
========================================= */

function editWeight(
    id
) {

    const record =
        weightLogs.find(
            item =>
                item.id ===
                id
        );


    if (
        !record
    ) {

        return;

    }


    editingWeightId =
        record.id;


    getElement(
        "weightDate"
    ).value =
        record.date;


    getElement(
        "weightValue"
    ).value =
        record.weight;


    getElement(
        "saveWeightBtn"
    ).textContent =
        "UPDATE WEIGHT";


    getElement(
        "cancelWeightEditBtn"
    ).style.display =
        "block";


    getElement(
        "weightValue"
    ).scrollIntoView({

        behavior:
            "smooth",

        block:
            "center"

    });

}


/* =========================================
   DELETE WEIGHT
========================================= */

function deleteWeight(
    id
) {

    const record =
        weightLogs.find(
            item =>
                item.id ===
                id
        );


    if (
        !record
    ) {

        return;

    }


    const confirmed =
        confirm(
            "Delete the weight entry for " +
            record.date +
            "?"
        );


    if (
        !confirmed
    ) {

        return;

    }


    weightLogs =
        weightLogs.filter(
            item =>
                item.id !==
                id
        );


    saveStorage();


    renderWeightPage();

}


/* =========================================
   SORT WEIGHT DATA
========================================= */

function getSortedWeights() {

    return [
        ...weightLogs
    ].sort(
        (
            a,
            b
        ) =>
            a.date.localeCompare(
                b.date
            )
    );

}


/* =========================================
   WEIGHT SUMMARY
========================================= */

function updateWeightSummary() {

    const sorted =
        getSortedWeights();


    if (
        sorted.length ===
        0
    ) {

        getElement(
            "currentWeight"
        ).textContent =
            "0";


        getElement(
            "startingWeight"
        ).textContent =
            "0";


        getElement(
            "weightChange"
        ).textContent =
            "0";


        getElement(
            "lowestWeight"
        ).textContent =
            "0";


        getElement(
            "highestWeight"
        ).textContent =
            "0";


        return;

    }


    const current =
        sorted[
            sorted.length - 1
        ].weight;


    const starting =
        sorted[0].weight;


    const lowest =
        Math.min(
            ...sorted.map(
                item =>
                    item.weight
            )
        );


    const highest =
        Math.max(
            ...sorted.map(
                item =>
                    item.weight
            )
        );


    const change =
        current -
        starting;


    getElement(
        "currentWeight"
    ).textContent =
        current.toFixed(
            1
        );


    getElement(
        "startingWeight"
    ).textContent =
        starting.toFixed(
            1
        );


    getElement(
        "weightChange"
    ).textContent =
        (
            change >= 0
                ? "+"
                : ""
        ) +
        change.toFixed(
            1
        );


    getElement(
        "lowestWeight"
    ).textContent =
        lowest.toFixed(
            1
        );


    getElement(
        "highestWeight"
    ).textContent =
        highest.toFixed(
            1
        );

}


/* =========================================
   WEIGHT HISTORY
========================================= */

function renderWeightHistory() {

    const container =
        getElement(
            "weightHistory"
        );


    container.innerHTML =
        "";


    const sorted =
        getSortedWeights()
            .reverse();


    if (
        sorted.length ===
        0
    ) {

        container.innerHTML = `

            <p class="muted">

                No weight entries yet.

            </p>

        `;


        return;

    }


    sorted.forEach(
        record => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "weight-history-row";


            row.innerHTML = `

                <div
                    class="weight-history-info">

                    <strong>

                        ${record.weight.toFixed(1)}
                        kg

                    </strong>

                    <span>

                        ${record.date}

                    </span>

                </div>


                <div
                    class="weight-history-actions">

                    <button
                        class="weight-edit-btn">

                        Edit

                    </button>


                    <button
                        class="weight-delete-btn">

                        Delete

                    </button>

                </div>

            `;


            row
                .querySelector(
                    ".weight-edit-btn"
                )
                .addEventListener(
                    "click",
                    function () {

                        editWeight(
                            record.id
                        );

                    }
                );


            row
                .querySelector(
                    ".weight-delete-btn"
                )
                .addEventListener(
                    "click",
                    function () {

                        deleteWeight(
                            record.id
                        );

                    }
                );


            container.appendChild(
                row
            );

        }
    );

}


/* =========================================
   WEIGHT GRAPH
========================================= */

function drawWeightChart() {

    const canvas =
        getElement(
            "weightChart"
        );


    if (
        typeof Chart ===
        "undefined"
    ) {

        return;

    }


    const sorted =
        getSortedWeights();


    const labels =
        sorted.map(
            item =>
                item.date
        );


    const values =
        sorted.map(
            item =>
                item.weight
        );


    if (
        weightChart
    ) {

        weightChart.destroy();

    }


    weightChart =
        new Chart(
            canvas,
            {

                type:
                    "line",

                data: {

                    labels:
                        labels,

                    datasets: [

                        {

                            label:
                                "Weight (kg)",

                            data:
                                values,

                            tension:
                                0.25,

                            pointRadius:
                                5,

                            pointHoverRadius:
                                7,

                            fill:
                                false

                        }

                    ]

                },


                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    interaction: {

                        intersect:
                            false,

                        mode:
                            "index"

                    },


                    scales: {

                        x: {

                            title: {

                                display:
                                    true,

                                text:
                                    "Date"

                            }

                        },


                        y: {

                            title: {

                                display:
                                    true,

                                text:
                                    "Weight (kg)"

                            },


                            beginAtZero:
                                false

                        }

                    },


                    plugins: {

                        legend: {

                            display:
                                false

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        return (
                                            context.parsed.y
                                                .toFixed(
                                                    1
                                                ) +
                                            " kg"
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================
   INITIAL LOAD
========================================= */

renderMeals();

renderSupplements();

renderFoodList();

calculateTotals();

renderHistory();

renderWeightPage();