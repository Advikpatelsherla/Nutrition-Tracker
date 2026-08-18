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

const TRACKER_STORAGE =
    "nutritionTrackerTrackers";

const TARGET_STORAGE =
    "nutritionTrackerTargets";

const WATER_STORAGE =
    "nutritionTrackerWater";

const STEP_STORAGE =
    "nutritionTrackerSteps";

const SAVED_DATES_STORAGE =
    "nutritionTrackerSavedDates";

const DAILY_SUMMARY_STORAGE =
    "nutritionTrackerDailySummaries";

const DAILY_META_STORAGE =
    "nutritionTrackerDailyLogMeta";


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

let savedDates =
    JSON.parse(
        localStorage.getItem(
            SAVED_DATES_STORAGE
        )
    ) || [...new Set(logs.map(item => item.date))];

let dailySummaries =
    JSON.parse(
        localStorage.getItem(
            DAILY_SUMMARY_STORAGE
        )
    ) || {};

let dailyLogMeta =
    JSON.parse(
        localStorage.getItem(
            DAILY_META_STORAGE
        )
    ) || {};


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

let trackerLogs =
    JSON.parse(
        localStorage.getItem(
            TRACKER_STORAGE
        )
    ) || {};

let waterLogs =
    JSON.parse(
        localStorage.getItem(
            WATER_STORAGE
        )
    ) || {};

let stepLogs =
    JSON.parse(
        localStorage.getItem(
            STEP_STORAGE
        )
    ) || {};

let targets =
    JSON.parse(
        localStorage.getItem(
            TARGET_STORAGE
        )
    ) || {};

targets = {
    protein: Number(targets.protein) || 120,
    calories: Number(targets.calories) || 1200,
    fibre: Number(targets.fibre) || 30,
    water: Number(targets.water) || 3,
    carbs: Number(targets.carbs) || 130,
    fat: Number(targets.fat) || 60,
    steps: Number(targets.steps) || 8000
};


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


async function saveStorage() {

    // Always keep the local copy.
    localStorage.setItem(
        FOOD_STORAGE,
        JSON.stringify(foods)
    );

    localStorage.setItem(
        LOG_STORAGE,
        JSON.stringify(logs)
    );

    localStorage.setItem(
        SAVED_DATES_STORAGE,
        JSON.stringify(savedDates)
    );

    localStorage.setItem(
        DAILY_SUMMARY_STORAGE,
        JSON.stringify(dailySummaries)
    );

    localStorage.setItem(
        DAILY_META_STORAGE,
        JSON.stringify(dailyLogMeta)
    );

    localStorage.setItem(
        SUPPLEMENT_STORAGE,
        JSON.stringify(supplementLogs)
    );

    localStorage.setItem(
        WEIGHT_STORAGE,
        JSON.stringify(weightLogs)
    );

    localStorage.setItem(
        WATER_STORAGE,
        JSON.stringify(waterLogs)
    );

    localStorage.setItem(
        STEP_STORAGE,
        JSON.stringify(stepLogs)
    );


    // Also save the same data to Firestore.
    if (
        !window.firebaseDB ||
        !window.firebaseFirestore
    ) {
        console.warn(
            "Firestore is not available. Local data was saved."
        );
        return;
    }

    try {

        const {
            doc,
            setDoc
        } = window.firebaseFirestore;

        await setDoc(
            doc(
                window.firebaseDB,
                "nutritionTracker",
                "data"
            ),
            {
                foods: foods,
                logs: logs,
                savedDates: savedDates,
                dailySummaries: dailySummaries,
                dailyLogMeta: dailyLogMeta,
                supplementLogs: supplementLogs,
                weightLogs: weightLogs,
                trackerLogs: trackerLogs,
                waterLogs: waterLogs,
                stepLogs: stepLogs,
                targets: targets,
                updatedAt: new Date().toISOString()
            }
        );

        console.log(
            "All nutrition data saved to Firestore."
        );

    } catch (error) {

        console.error(
            "Firestore save failed. Local data is still safe:",
            error
        );

    }

}


/* =========================================
   FIRESTORE SYNC
========================================= */

async function loadDataFromFirestore() {

    if (
        !window.firebaseDB ||
        !window.firebaseFirestore
    ) {
        console.warn(
            "Firestore is not available. Using local data."
        );
        return;
    }

    try {

        const {
            doc,
            getDoc,
            setDoc
        } = window.firebaseFirestore;

        const dataRef = doc(
            window.firebaseDB,
            "nutritionTracker",
            "data"
        );

        const snapshot = await getDoc(
            dataRef
        );

        if (snapshot.exists()) {

            const data = snapshot.data();

            if (Array.isArray(data.foods)) {

                foods = data.foods;

                localStorage.setItem(
                    FOOD_STORAGE,
                    JSON.stringify(foods)
                );

            }

            if (Array.isArray(data.logs)) {

                logs = data.logs;

                localStorage.setItem(
                    LOG_STORAGE,
                    JSON.stringify(logs)
                );

            }

            if (Array.isArray(data.savedDates)) {
                savedDates = data.savedDates;
                localStorage.setItem(
                    SAVED_DATES_STORAGE,
                    JSON.stringify(savedDates)
                );
            } else {
                savedDates = [...new Set(logs.map(item => item.date))];
                localStorage.setItem(
                    SAVED_DATES_STORAGE,
                    JSON.stringify(savedDates)
                );
            }

            if (
                data.stepLogs &&
                typeof data.stepLogs === "object"
            ) {
                stepLogs = data.stepLogs;
                localStorage.setItem(
                    STEP_STORAGE,
                    JSON.stringify(stepLogs)
                );
            }

            if (
                data.dailySummaries &&
                typeof data.dailySummaries === "object"
            ) {
                dailySummaries = data.dailySummaries;
                localStorage.setItem(
                    DAILY_SUMMARY_STORAGE,
                    JSON.stringify(dailySummaries)
                );
            }

            if (
                data.dailyLogMeta &&
                typeof data.dailyLogMeta === "object"
            ) {
                dailyLogMeta = data.dailyLogMeta;
                localStorage.setItem(
                    DAILY_META_STORAGE,
                    JSON.stringify(dailyLogMeta)
                );
            }


            if (
                data.supplementLogs &&
                typeof data.supplementLogs === "object"
            ) {

                supplementLogs =
                    data.supplementLogs;

                localStorage.setItem(
                    SUPPLEMENT_STORAGE,
                    JSON.stringify(
                        supplementLogs
                    )
                );

            }

            if (Array.isArray(data.weightLogs)) {

                weightLogs =
                    data.weightLogs;

                localStorage.setItem(
                    WEIGHT_STORAGE,
                    JSON.stringify(
                        weightLogs
                    )
                );

            }

            if (
                data.trackerLogs &&
                typeof data.trackerLogs === "object"
            ) {

                trackerLogs =
                    data.trackerLogs;

                localStorage.setItem(
                    TRACKER_STORAGE,
                    JSON.stringify(
                        trackerLogs
                    )
                );

            }

            if (
                data.waterLogs &&
                typeof data.waterLogs === "object"
            ) {
                waterLogs = data.waterLogs;
                localStorage.setItem(
                    WATER_STORAGE,
                    JSON.stringify(waterLogs)
                );
            }

            if (
                data.targets &&
                typeof data.targets === "object"
            ) {

                targets = {
                    protein: Number(data.targets.protein) || 120,
                    calories: Number(data.targets.calories) || 1200,
                    fibre: Number(data.targets.fibre) || 30,
                    water: Number(data.targets.water) || 3,
                    carbs: Number(data.targets.carbs) || 130,
                    fat: Number(data.targets.fat) || 60,
                    steps: Number(data.targets.steps) || 8000
                };

                localStorage.setItem(
                    TARGET_STORAGE,
                    JSON.stringify(
                        targets
                    )
                );

            }

            console.log(
                "Nutrition data loaded from Firestore."
            );

        } else {

            /*
             * First-time migration:
             * If localStorage already has data,
             * upload it to Firestore instead of
             * replacing it with an empty database.
             */

            const hasLocalData =
                foods.length > 0 ||
                logs.length > 0 ||
                Object.keys(
                    supplementLogs
                ).length > 0 ||
                weightLogs.length > 0 ||
                Object.keys(trackerLogs).length > 0 ||
                Object.keys(waterLogs).length > 0;

            if (hasLocalData) {

                await setDoc(
                    dataRef,
                    {
                        foods: foods,
                        logs: logs,
                        savedDates: savedDates,
                        dailySummaries: dailySummaries,
                        dailyLogMeta: dailyLogMeta,
                        supplementLogs:
                            supplementLogs,
                        weightLogs:
                            weightLogs,
                        trackerLogs:
                            trackerLogs,
                        waterLogs:
                            waterLogs,
                        targets:
                            targets,
                        updatedAt:
                            new Date().toISOString()
                    }
                );

                console.log(
                    "Existing local data migrated to Firestore."
                );

            } else {

                console.log(
                    "No existing data found. Starting with empty data."
                );

            }

        }

    } catch (error) {

        console.error(
            "Firestore load failed. Continuing with local data:",
            error
        );

    }

}


async function initializeAppData() {

    await loadDataFromFirestore();

    cleanupExpiredDailyFoodLogs();
    saveStorage();

    renderMeals();

    renderSupplements();

    loadTargetInputs();

    renderMeals();

    renderSupplements();

    renderFoodList();

    renderDailyTrackers();

    loadWaterIntake();
    calculateTotals();

    renderHistory();
    renderProgressAverages();

    renderProgressTrackers();

    updateRings();

    renderWeightPage();

}



/* =========================================
   DAILY SUMMARY + 24-HOUR EDIT WINDOW
========================================= */

function getDailyMeta(date) {
    return dailyLogMeta[date] || null;
}

function getDailySummary(date) {
    return dailySummaries[date] || null;
}

function getDailyEditDeadline(date) {
    if (!date) return null;

    const midnight = new Date(`${date}T00:00:00`);
    if (Number.isNaN(midnight.getTime())) return null;

    midnight.setDate(midnight.getDate() + 1);
    return midnight.getTime();
}

function isDailyLogEditable(date) {
    return (
        !!date &&
        date === getLocalDateString() &&
        savedDates.includes(date)
    );
}

function formatDailyDeadline(date) {
    const deadline = getDailyEditDeadline(date);
    if (!deadline) return "";

    return new Date(deadline).toLocaleString(
        undefined,
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}

function calculateTotalForDate(date) {
    const summary = getDailySummary(date);
    if (summary) {
        return {
            calories: Number(summary.calories) || 0,
            protein: Number(summary.protein) || 0,
            carbs: Number(summary.carbs) || 0,
            fat: Number(summary.fat) || 0,
            fibre: Number(summary.fibre) || 0
        };
    }

    const total = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fibre: 0
    };

    logs
        .filter(item => item.date === date)
        .forEach(item => {
            const nutrition = getNutrition(item.food, item.amount);
            if (!nutrition) return;

            total.calories += Number(nutrition.calories) || 0;
            total.protein += Number(nutrition.protein) || 0;
            total.carbs += Number(nutrition.carbs) || 0;
            total.fat += Number(nutrition.fat) || 0;
            total.fibre += Number(nutrition.fibre) || 0;
        });

    return total;
}

function updateDailySummaryFromCurrentDay(date) {
    const total = calculateCurrentFoodTotal();

    if (!dailySummaries[date]) {
        dailySummaries[date] = {};
    }

    dailySummaries[date] = {
        date,
        calories: Number(total.calories) || 0,
        protein: Number(total.protein) || 0,
        carbs: Number(total.carbs) || 0,
        fat: Number(total.fat) || 0,
        fibre: Number(total.fibre) || 0,
        water: Number(waterLogs[date]) || 0,
        steps: Number(stepLogs[date]) || 0,
        gym: trackerLogs[date]?.gym === true,
        sugar: trackerLogs[date]?.sugar === true,
        main: trackerLogs[date]?.main === true,
        supplements: trackerLogs[date]?.supplements === true,
        weight: Number(
            weightLogs.find(item => item.date === date)?.weight
        ) || null,
        targets: {
            protein: Number(targets.protein) || 120,
            calories: Number(targets.calories) || 1200,
            fibre: Number(targets.fibre) || 30,
            water: Number(targets.water) || 3,
            carbs: Number(targets.carbs) || 130,
            fat: Number(targets.fat) || 60,
            steps: Number(targets.steps) || 8000
        }
    };

    if (!savedDates.includes(date)) {
        savedDates.push(date);
        savedDates.sort();
    }
}

function cleanupExpiredDailyFoodLogs() {
    const todayDate = getLocalDateString();

    Object.keys(dailyLogMeta).forEach(date => {
        if (!dailyLogMeta[date]?.savedAt) return;

        /*
         * Meal-level data belongs to the calendar day.
         * A save at 10:00 AM remains editable until local midnight.
         * At the next calendar day, only the compact daily summary remains.
         */
        const expired =
            date < todayDate;

        if (expired) {
            logs = logs.filter(item => item.date !== date);

            /*
             * The summary remains permanently.
             * Only the meal-level temporary data is removed.
             */
        }
    });

    /*
     * Legacy data:
     * If an older saved date has meal data but no summary yet,
     * create its summary once before the old food entries are
     * discarded.
     */
    [...savedDates].forEach(date => {
        if (!dailySummaries[date]) {
            const total = {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                fibre: 0
            };

            logs
                .filter(item => item.date === date)
                .forEach(item => {
                    const nutrition = getNutrition(item.food, item.amount);
                    if (!nutrition) return;

                    total.calories += Number(nutrition.calories) || 0;
                    total.protein += Number(nutrition.protein) || 0;
                    total.carbs += Number(nutrition.carbs) || 0;
                    total.fat += Number(nutrition.fat) || 0;
                    total.fibre += Number(nutrition.fibre) || 0;
                });

            dailySummaries[date] = {
                date,
                ...total,
                water: Number(waterLogs[date]) || 0,
                steps: Number(stepLogs[date]) || 0,
                gym: trackerLogs[date]?.gym === true,
                sugar: trackerLogs[date]?.sugar === true,
                main: trackerLogs[date]?.main === true,
                supplements: trackerLogs[date]?.supplements === true,
                weight: Number(
                    weightLogs.find(item => item.date === date)?.weight
                ) || null,
                targets: {
                    protein: Number(targets.protein) || 120,
                    calories: Number(targets.calories) || 1200,
                    fibre: Number(targets.fibre) || 30,
                    water: Number(targets.water) || 3,
                    carbs: Number(targets.carbs) || 130,
                    fat: Number(targets.fat) || 60,
                    steps: Number(targets.steps) || 8000
                }
            };

            /*
             * Existing historical dates are considered closed.
             * Today remains editable if it was already saved.
             */
            if (!dailyLogMeta[date]) {
                dailyLogMeta[date] = {
                    savedAt:
                        date === todayDate
                            ? new Date().toISOString()
                            : `${date}T00:00:00`
                };
            }
        }
    });
}

function getProgressTotals(date) {
    return calculateTotalForDate(date);
}

function showProgressForDate(date) {
    const targetDate = date || getLocalDateString();
    currentProgressDate = targetDate;

    const summary = getDailySummary(targetDate);

    if (summary) {
        updateRings(
            {
                calories: Number(summary.calories) || 0,
                protein: Number(summary.protein) || 0,
                carbs: Number(summary.carbs) || 0,
                fat: Number(summary.fat) || 0,
                fibre: Number(summary.fibre) || 0,
                water: Number(summary.water) || 0,
                steps: Number(summary.steps) || 0
            },
            summary.targets || null
        );
        loadTargetInputsForDate(summary.targets || targets);
    } else {
        updateRings(null, targets);
        loadTargetInputsForDate(targets);
    }

    renderProgressTrackers();

    const label = getElement("progressDateLabel");
    if (label) {
        label.textContent =
            targetDate === getLocalDateString()
                ? `Today • ${formatDisplayDate(targetDate)}`
                : `Progress for ${formatDisplayDate(targetDate)}`;
    }
}

let currentProgressDate = getLocalDateString();

/* =========================================
   DATE + DAILY TARGETS
========================================= */

function getLocalDateString(date = new Date()) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


const today =
    getLocalDateString();


getElement(
    "logDate"
).value = today;


getElement(
    "fromDate"
).value = today;


getElement(
    "toDate"
).value = today;

if (getElement("dailyHistoryFromDate")) {
    getElement("dailyHistoryFromDate").value = today;
}
if (getElement("dailyHistoryToDate")) {
    getElement("dailyHistoryToDate").value = today;
}


getElement(
    "weightDate"
).value = today;


function saveTargets() {

    targets.protein =
        Number(
            getElement(
                "proteinTarget"
            ).value
        ) || 120;

    targets.calories =
        Number(
            getElement(
                "calorieTarget"
            ).value
        ) || 1200;

    targets.fibre =
        Number(
            getElement(
                "fibreTarget"
            ).value
        ) || 30;

    targets.water =
        Number(
            getElement(
                "waterTarget"
            ).value
        ) || 3;

    targets.carbs =
        Number(getElement("carbsTarget")?.value) || 130;

    targets.fat =
        Number(getElement("fatTarget")?.value) || 60;

    targets.steps =
        Number(getElement("stepsTarget")?.value) || 8000;

    localStorage.setItem(
        TARGET_STORAGE,
        JSON.stringify(targets)
    );

    const progressPageActive =
        getElement("progressPage")?.classList.contains("active");

    const targetDate =
        progressPageActive
            ? (currentProgressDate || getLocalDateString())
            : (getElement("logDate")?.value || getLocalDateString());

    // Target values are part of the daily Progress snapshot.
    // If the day already has a saved summary, update that day's snapshot.
    if (dailySummaries[targetDate]) {
        dailySummaries[targetDate].targets = { ...targets };
    }

    saveStorage();

    updateRings(
        targetDate === currentProgressDate && dailySummaries[targetDate]
            ? {
                calories: Number(dailySummaries[targetDate].calories) || 0,
                protein: Number(dailySummaries[targetDate].protein) || 0,
                carbs: Number(dailySummaries[targetDate].carbs) || 0,
                fat: Number(dailySummaries[targetDate].fat) || 0,
                fibre: Number(dailySummaries[targetDate].fibre) || 0,
                water: Number(dailySummaries[targetDate].water) || 0,
                steps: Number(dailySummaries[targetDate].steps) || 0
            }
            : null,
        targets
    );

}


function loadTargetInputsForDate(targetSet = targets) {

    if (getElement("proteinTarget")) {
        getElement("proteinTarget").value = Number(targetSet.protein) || 120;
    }

    if (getElement("calorieTarget")) {
        getElement("calorieTarget").value = Number(targetSet.calories) || 1200;
    }

    if (getElement("fibreTarget")) {
        getElement("fibreTarget").value = Number(targetSet.fibre) || 30;
    }

    if (getElement("waterTarget")) {
        getElement("waterTarget").value = Number(targetSet.water) || 3;
    }

    if (getElement("carbsTarget")) {
        getElement("carbsTarget").value = Number(targetSet.carbs) || 130;
    }

    if (getElement("fatTarget")) {
        getElement("fatTarget").value = Number(targetSet.fat) || 60;
    }

    if (getElement("stepsTarget")) {
        getElement("stepsTarget").value = Number(targetSet.steps) || 8000;
    }
}

function loadTargetInputs() {
    loadTargetInputsForDate(targets);
}



/* =========================================
   WATER INTAKE
========================================= */

function getWaterDate() {
    return getElement("logDate")?.value || getLocalDateString();
}

function getWaterIntake(date = getWaterDate()) {
    return Number(waterLogs[date]) || 0;
}

function saveWaterIntake() {
    const input = getElement("waterIntake");
    if (!input) return;

    const date = getWaterDate();
    const value = Math.max(0, Number(input.value) || 0);

    waterLogs[date] = value;

    if (dailySummaries[date]) {
        dailySummaries[date].water = value;
    }

    if (value > 0 && !savedDates.includes(date)) {
        savedDates.push(date);
        savedDates.sort();
    }

    saveStorage();
    updateRings();
    renderHistory();
}

function loadWaterIntake() {
    const input = getElement("waterIntake");
    if (input) {
        input.value = getWaterIntake().toFixed(1);
    }

    const target = getElement("dailyWaterTarget");
    if (target) {
        target.textContent = Number(targets.water || 3);
    }
}

/* =========================================
   STEP COUNT
========================================= */

function getStepDate() {
    return getElement("logDate")?.value || getLocalDateString();
}

function getStepCount(date = getStepDate()) {
    return Number(stepLogs[date]) || 0;
}

function saveStepCount() {
    const input = getElement("stepCount");
    if (!input) return;

    const date = getStepDate();
    const value = Math.max(0, Math.floor(Number(input.value) || 0));

    stepLogs[date] = value;

    if (dailySummaries[date]) {
        dailySummaries[date].steps = value;
    }

    saveStorage();
    updateRings();
    renderHistory();
}

function loadStepCount() {
    const input = getElement("stepCount");
    if (input) {
        input.value = String(getStepCount());
    }

    const target = getElement("dailyStepTarget");
    if (target) {
        target.textContent = Number(targets.steps || 8000).toLocaleString();
    }
}

getElement("waterIntake")?.addEventListener(
    "change",
    saveWaterIntake
);

getElement("stepCount")?.addEventListener(
    "change",
    saveStepCount
);

/* =========================================
   DAILY HABIT TRACKERS
========================================= */

const TRACKERS = [
    {
        key: "gym",
        name: "Gym",
        successValue: true,
        help: "Tick when you went to the gym."
    },
    {
        key: "sugar",
        name: "Sugar",
        successValue: false,
        help: "Tick when you took sugar. Streak counts sugar-free days."
    },
    {
        key: "main",
        name: "Main",
        successValue: false,
        help: "Tick when your main daily goal is missed. Leave unticked when successful."
    },
    {
        key: "supplements",
        name: "Supplements",
        successValue: true,
        help: "Tick when you completed your supplements."
    }
];


function getTrackerDate() {

    return getElement(
        "logDate"
    ).value || getLocalDateString();

}


function setTrackerValue(
    date,
    key,
    value
) {

    if (
        !trackerLogs[date]
    ) {
        trackerLogs[date] = {};
    }

    trackerLogs[date][key] =
        value;

    if (dailySummaries[date]) {
        dailySummaries[date][key] = value;
    }

    saveStorage();

    renderDailyTrackers();
    renderProgressTrackers();

}


function renderDailyTrackers() {

    const container =
        getElement(
            "dailyTrackerList"
        );

    if (!container) {
        return;
    }

    const date =
        getTrackerDate();

    const saved =
        trackerLogs[date] || {};

    container.innerHTML = "";

    TRACKERS.forEach(
        tracker => {

            const label =
                document.createElement(
                    "label"
                );

            label.className =
                "habit-check";

            const checkbox =
                document.createElement(
                    "input"
                );

            checkbox.type =
                "checkbox";

            checkbox.checked =
                saved[tracker.key] === true;

            checkbox.addEventListener(
                "change",
                function () {

                    setTrackerValue(
                        date,
                        tracker.key,
                        checkbox.checked
                    );

                }
            );

            const text =
                document.createElement(
                    "span"
                );

            text.innerHTML = `
                <strong>${tracker.name}</strong>
                <small>${tracker.help}</small>
            `;

            label.appendChild(
                checkbox
            );

            label.appendChild(
                text
            );

            container.appendChild(
                label
            );

        }
    );

}


function getFirstTrackedDate(tracker) {
    const dates = Object.keys(trackerLogs || {})
        .filter(date =>
            trackerLogs[date] &&
            typeof trackerLogs[date][tracker.key] === "boolean"
        )
        .sort();

    return dates.length ? dates[0] : null;
}

function trackerSucceeded(
    date,
    tracker
) {
    const trackerDay =
        trackerLogs[date] || {};

    const summary =
        dailySummaries[date] || {};

    /*
     * Sugar + Main:
     *
     * UNCHECKED = SUCCESS.
     *
     * If there is an explicit tracker value, use it.
     * If there is no explicit value but the day has been saved,
     * an unchecked Sugar/Main box is a successful day.
     */
    if (
        tracker.successValue === false
    ) {
        const hasSavedDay =
            savedDates.includes(date) ||
            !!dailySummaries[date];

        if (!hasSavedDay) {
            return false;
        }

        /*
         * An explicit true means the user ticked the box:
         * sugar was taken / Main was missed -> streak breaks.
         */
        return trackerDay[tracker.key] !== true &&
            summary[tracker.key] !== true;
    }

    /*
     * Gym + Supplements:
     * checked = success.
     */
    return (
        trackerDay[tracker.key] === true ||
        summary[tracker.key] === true
    );
}


function getTrackerStreak(
    tracker
) {
    let streak = 0;

    const date =
        new Date();

    date.setHours(
        12,
        0,
        0,
        0
    );

    while (true) {
        const dateString =
            getLocalDateString(date);

        if (
            !trackerSucceeded(
                dateString,
                tracker
            )
        ) {
            break;
        }

        streak++;

        date.setDate(
            date.getDate() - 1
        );
    }

    return streak;
}


function formatDisplayDate(
    dateString
) {
    if (!dateString) return "";

    const date =
        new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return [
        String(date.getDate()).padStart(2, "0"),
        String(date.getMonth() + 1).padStart(2, "0"),
        date.getFullYear()
    ].join("-");
}

/* Backward-compatible name. */
function formatShortDate(dateString) {
    return formatDisplayDate(dateString);
}


function renderTrackerHeatmap(
    tracker,
    grid,
    streakElement,
    selectedDate = getLocalDateString()
) {
    if (!grid) return;

    grid.innerHTML = "";
    grid.classList.add(
        "centered-year-heatmap"
    );

    const today =
        new Date();

    today.setHours(
        12,
        0,
        0,
        0
    );

    const currentWeekStart =
        new Date(today);

    currentWeekStart.setDate(
        currentWeekStart.getDate() -
        currentWeekStart.getDay()
    );

    const startDate =
        new Date(currentWeekStart);

    startDate.setDate(
        startDate.getDate() -
        (26 * 7)
    );

    const totalWeeks = 53;

    for (
        let week = 0;
        week < totalWeeks;
        week++
    ) {
        for (
            let day = 0;
            day < 7;
            day++
        ) {
            const cursor =
                new Date(startDate);

            cursor.setDate(
                cursor.getDate() +
                (week * 7) +
                day
            );

            const dateString =
                getLocalDateString(cursor);

            const cell =
                document.createElement("span");

            cell.className =
                "habit-cell";

            const todayString =
                getLocalDateString(today);

            const isFuture =
                dateString > todayString;

            const isSuccess =
                trackerSucceeded(
                    dateString,
                    tracker
                );

            const isAvoidanceTracker =
                tracker.successValue === false;

            /*
             * Sugar/Main:
             * saved day + unchecked = DONE/GREEN.
             *
             * Gym/Supplements:
             * checked = DONE/GREEN.
             *
             * A historical day that is not successful is RED.
             * Future days remain gray.
             */
            if (isFuture) {
                cell.classList.add("future");
            } else if (isSuccess) {
                cell.classList.add("done");
            } else {
                cell.classList.add("failed");
            }

            if (week === 26) {
                cell.classList.add(
                    "current-week"
                );
            }

            if (
                dateString === todayString
            ) {
                cell.classList.add(
                    "today-cell"
                );
            }

            /*
             * Historical Progress selection.
             * The blue indicator follows the date currently opened
             * instead of remaining fixed on today's square.
             */
            if (
                dateString === selectedDate
            ) {
                cell.classList.add(
                    "selected-date-cell"
                );
                cell.setAttribute(
                    "aria-current",
                    "date"
                );
            }

            cell.title =
                `${tracker.name} • ${formatDisplayDate(dateString)}`;

            grid.appendChild(cell);
        }
    }

    if (streakElement) {
        streakElement.textContent =
            String(
                getTrackerStreak(tracker)
            );
    }
}


function renderProgressTrackers() {

    TRACKERS.forEach(
        tracker => {

            const streakElement = getElement(
                `${tracker.key}Streak`
            );

            if (streakElement) {
                const streak = getTrackerStreak(tracker);

                streakElement.textContent =
                    String(streak);

                // Keep both the number AND its parent container
                // visible on desktop, full-screen and mobile.
                streakElement.hidden = false;
                streakElement.style.display =
                    "inline-block";
                streakElement.style.visibility =
                    "visible";
                streakElement.style.opacity =
                    "1";
                streakElement.style.position =
                    "relative";
                streakElement.style.zIndex =
                    "10000";

                const streakBox =
                    streakElement.parentElement;

                if (streakBox) {
                    streakBox.hidden = false;
                    streakBox.style.setProperty(
                        "display",
                        "flex",
                        "important"
                    );
                    streakBox.style.setProperty(
                        "visibility",
                        "visible",
                        "important"
                    );
                    streakBox.style.setProperty(
                        "opacity",
                        "1",
                        "important"
                    );
                    streakBox.style.setProperty(
                        "position",
                        "relative",
                        "important"
                    );
                    streakBox.style.setProperty(
                        "flex",
                        "0 0 auto",
                        "important"
                    );
                    streakBox.style.setProperty(
                        "min-width",
                        "78px",
                        "important"
                    );
                    streakBox.style.setProperty(
                        "margin-left",
                        "auto",
                        "important"
                    );
                    streakBox.style.setProperty(
                        "justify-content",
                        "flex-end",
                        "important"
                    );
                    streakBox.style.setProperty(
                        "align-items",
                        "baseline",
                        "important"
                    );
                    streakBox.style.setProperty(
                        "gap",
                        "4px",
                        "important"
                    );
                    streakBox.style.setProperty(
                        "white-space",
                        "nowrap",
                        "important"
                    );
                    streakBox.style.setProperty(
                        "z-index",
                        "10000",
                        "important"
                    );
                }
            }

            const grid = getElement(
                `${tracker.key}TrackerGrid`
            );

            renderTrackerHeatmap(
                tracker,
                grid,
                streakElement,
                currentProgressDate || getLocalDateString()
            );
        }
    );

}


/* =========================================
   NUTRITION RINGS
========================================= */


function ringHexToRgb(hex) {
    const value = hex.replace("#", "");
    return {
        r: parseInt(value.substring(0, 2), 16),
        g: parseInt(value.substring(2, 4), 16),
        b: parseInt(value.substring(4, 6), 16)
    };
}

function ringRgbToHex(r, g, b) {
    return "#" + [r, g, b]
        .map(v =>
            Math.max(0, Math.min(255, Math.round(v)))
                .toString(16)
                .padStart(2, "0")
        )
        .join("");
}

function ringLighten(hex, amount) {
    const rgb = ringHexToRgb(hex);

    return ringRgbToHex(
        rgb.r + (255 - rgb.r) * amount,
        rgb.g + (255 - rgb.g) * amount,
        rgb.b + (255 - rgb.b) * amount
    );
}

function ensureRingExtraLayers(key, requiredLaps) {

    const progress =
        getElement(`${key}RingProgress`);

    if (!progress) {
        return [];
    }

    const svg =
        progress.closest("svg");

    if (!svg) {
        return [];
    }

    const layers = [];

    /*
     * Ring #1 is the existing RingProgress.
     * Ring #2 already exists as RingExtra.
     * Additional rings are created only when needed.
     */
    let second =
        getElement(`${key}RingExtra`);

    if (!second) {
        second =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle"
            );

        second.id =
            `${key}RingExtra`;

        second.className.baseVal =
            "ring-extra ring-lap";

        second.setAttribute("cx", "70");
        second.setAttribute("cy", "70");
        second.setAttribute("r", "54");

        svg.insertBefore(
            second,
            getElement(`${key}RingTipShadow`)
        );
    }

    second.classList.add("ring-lap");
    layers.push(second);

    for (
        let lap = 3;
        lap <= requiredLaps;
        lap++
    ) {

        let element =
            getElement(`${key}RingLap${lap}`);

        if (!element) {

            element =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "circle"
                );

            element.id =
                `${key}RingLap${lap}`;

            element.classList.add(
                "ring-extra",
                "ring-lap"
            );

            element.setAttribute("cx", "70");
            element.setAttribute("cy", "70");
            element.setAttribute("r", "54");

            svg.insertBefore(
                element,
                getElement(`${key}RingTipShadow`)
            );
        }

        layers.push(element);
    }

    return layers;
}

function updateRings(
    suppliedTotal = null,
    suppliedTargets = null
) {
    const total =
        suppliedTotal ||
        calculateCurrentFoodTotal();

    const ringTargets = {
        protein: Number(suppliedTargets?.protein ?? targets.protein) || 120,
        calories: Number(suppliedTargets?.calories ?? targets.calories) || 1200,
        fibre: Number(suppliedTargets?.fibre ?? targets.fibre) || 30,
        water: Number(suppliedTargets?.water ?? targets.water) || 3,
        carbs: Number(suppliedTargets?.carbs ?? targets.carbs) || 130,
        fat: Number(suppliedTargets?.fat ?? targets.fat) || 60,
        steps: Number(suppliedTargets?.steps ?? targets.steps) || 8000
    };

    const ringData = [
        {
            key: "protein",
            value: Number(total.protein) || 0,
            target: ringTargets.protein,
            color: "#e53935",
            decimals: 1
        },
        {
            key: "calories",
            value: Number(total.calories) || 0,
            target: ringTargets.calories,
            color: "#f59e0b",
            decimals: 0
        },
        {
            key: "fibre",
            value: Number(total.fibre) || 0,
            target: ringTargets.fibre,
            color: "#22c55e",
            decimals: 1
        },
        {
            key: "water",
            value:
                suppliedTotal &&
                Object.prototype.hasOwnProperty.call(
                    suppliedTotal,
                    "water"
                )
                    ? Number(suppliedTotal.water) || 0
                    : Number(getWaterIntake()) || 0,
            target: ringTargets.water,
            color: "#2196f3",
            decimals: 1
        },
        {
            key: "steps",
            value:
                suppliedTotal &&
                Object.prototype.hasOwnProperty.call(
                    suppliedTotal,
                    "steps"
                )
                    ? Number(suppliedTotal.steps) || 0
                    : Number(getStepCount()) || 0,
            target: ringTargets.steps,
            color: "#8b5cf6",
            decimals: 0
        },
        {
            key: "fat",
            value: Number(total.fat) || 0,
            target: ringTargets.fat,
            color: "#f97316",
            decimals: 1
        },
        {
            key: "carbs",
            value: Number(total.carbs) || 0,
            target: ringTargets.carbs,
            color: "#06b6d4",
            decimals: 1
        }
    ];

    const radius = 54;
    const circumference = 2 * Math.PI * radius;

    const lightenColor = (hex, amount) => {
        const n = hex.replace("#", "");
        const r = parseInt(n.slice(0, 2), 16);
        const g = parseInt(n.slice(2, 4), 16);
        const b = parseInt(n.slice(4, 6), 16);

        return "#" + [r, g, b].map(v =>
            Math.round(v + (255 - v) * amount)
                .toString(16)
                .padStart(2, "0")
        ).join("");
    };

    ringData.forEach(item => {
        const baseRing =
            getElement(`${item.key}RingProgress`);

        const activeRing =
            getElement(`${item.key}RingExtra`);

        const tip =
            getElement(`${item.key}RingTipShadow`);

        const valueEl =
            getElement(`${item.key}RingValue`);

        const targetEl =
            getElement(`${item.key}RingTarget`);

        if (!baseRing || !activeRing || !valueEl || !targetEl) {
            return;
        }

        const safeTarget =
            item.target > 0 ? item.target : 1;

        const ratio =
            Math.max(Number(item.value) / safeTarget, 0);

        const completedLaps =
            Math.floor(ratio);

        const remainder =
            ratio - completedLaps;

        /*
         * IMPORTANT:
         * Use dasharray to define the visible arc directly.
         * This avoids browser/viewport-specific dashoffset behavior.
         *
         * 0%   -> 0 visible colored arc
         * 50%  -> half arc
         * 100% -> full dark base ring
         * 110% -> light full ring + dark 10% second lap
         * 200% -> light full ring, no extra lap
         * 201% -> lighter full ring + dark 1% next lap
         */
        const baseVisible =
            ratio < 1 ? circumference * ratio : circumference;

        const baseColor =
            ratio > 1
                ? lightenColor(
                    item.color,
                    Math.min(
                        0.30 +
                        Math.max(completedLaps - 1, 0) * 0.12,
                        0.78
                    )
                )
                : item.color;

        baseRing.style.setProperty(
            "stroke",
            baseColor,
            "important"
        );

        baseRing.style.setProperty(
            "stroke-width",
            "10px",
            "important"
        );

        baseRing.style.setProperty(
            "stroke-dasharray",
            `${baseVisible} ${circumference}`,
            "important"
        );

        baseRing.style.setProperty(
            "stroke-dashoffset",
            "0",
            "important"
        );

        baseRing.style.setProperty(
            "filter",
            "none",
            "important"
        );

        /*
         * At exactly 0%, explicitly hide the colored path.
         * This is intentionally separate so zero can never display
         * a residual arc on desktop, mobile, or after a date change.
         */
        if (ratio <= 0) {
            baseRing.style.setProperty(
                "stroke-dasharray",
                `0 ${circumference}`,
                "important"
            );

            baseRing.style.setProperty(
                "opacity",
                "0",
                "important"
            );
        } else {
            baseRing.style.setProperty(
                "opacity",
                "1",
                "important"
            );
        }

        /*
         * Extra lap starts only after 100%.
         * Exactly 100%, 200%, 300%, etc. has no extra lap.
         */
        if (ratio > 1 && remainder > 0) {
            activeRing.style.setProperty(
                "stroke",
                item.color,
                "important"
            );

            activeRing.style.setProperty(
                "stroke-width",
                "11px",
                "important"
            );

            activeRing.style.setProperty(
                "stroke-dasharray",
                `${circumference * remainder} ${circumference}`,
                "important"
            );

            activeRing.style.setProperty(
                "stroke-dashoffset",
                "0",
                "important"
            );

            activeRing.style.setProperty(
                "opacity",
                "1",
                "important"
            );

            activeRing.style.setProperty(
                "filter",
                "none",
                "important"
            );

            // No black dot/tip marker. The active lap is represented only by its colored arc.
            if (tip) {
                tip.style.setProperty("display", "none", "important");
                tip.style.setProperty("opacity", "0", "important");
            }
        } else {
            activeRing.style.setProperty(
                "stroke-dasharray",
                `0 ${circumference}`,
                "important"
            );

            activeRing.style.setProperty(
                "stroke-dashoffset",
                "0",
                "important"
            );

            activeRing.style.setProperty(
                "opacity",
                "0",
                "important"
            );

            if (tip) {
                tip.style.setProperty(
                    "opacity",
                    "0",
                    "important"
                );

                tip.style.setProperty(
                    "display",
                    "none",
                    "important"
                );
            }
        }

        /*
         * Hide legacy dynamically-created lap layers. They must never
         * create a residual colored arc at zero.
         */
        const svg =
            baseRing.closest("svg");

        if (svg) {
            svg.querySelectorAll(".ring-extra").forEach(layer => {
                if (layer !== activeRing) {
                    layer.style.setProperty(
                        "stroke-dasharray",
                        `0 ${circumference}`,
                        "important"
                    );
                    layer.style.setProperty(
                        "opacity",
                        "0",
                        "important"
                    );
                }
            });
        }

        valueEl.textContent =
            item.decimals === 0
                ? Math.round(item.value).toLocaleString()
                : item.value.toFixed(item.decimals);

        targetEl.textContent =
            item.key === "steps"
                ? Math.round(item.target).toLocaleString()
                : item.target;

        if (item.key === "water") {
            const dailyTarget =
                getElement("dailyWaterTarget");

            if (dailyTarget) {
                dailyTarget.textContent = item.target;
            }
        }

        if (item.key === "steps") {
            const dailyTarget =
                getElement("dailyStepTarget");

            if (dailyTarget) {
                dailyTarget.textContent =
                    Math.round(item.target).toLocaleString();
            }
        }
    });
}


function calculateCurrentFoodTotal() {

    const total = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fibre: 0
    };

    const date =
        getElement(
            "logDate"
        )?.value ||
        getLocalDateString();

    logs
        .filter(
            item =>
                item.date === date
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

    return total;

}


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
                    showProgressForDate(
                        currentProgressDate ||
                        getLocalDateString()
                    );
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



getElement("waterIntake")?.addEventListener(
    "change",
    saveWaterIntake
);

/* =========================================
   TARGET EDITING
========================================= */

[
    "proteinTarget",
    "calorieTarget",
    "fibreTarget",
    "waterTarget",
    "carbsTarget",
    "fatTarget",
    "stepsTarget"
].forEach(
    id => {

        const input =
            getElement(id);

        if (input) {

            input.addEventListener(
                "change",
                saveTargets
            );

        }

    }
);


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
            "input"
        );

    foodSelect.type = "search";
    foodSelect.placeholder = "Search food, protein powder or dish...";
    foodSelect.setAttribute("autocomplete", "off");

    const listId = "meal-food-list-" + Date.now() + "-" + Math.random().toString(36).slice(2);
    foodSelect.setAttribute("list", listId);

    const foodList = document.createElement("datalist");
    foodList.id = listId;

    foods
        .filter(food => food.category !== "supplement")
        .forEach(food => {
            const option = document.createElement("option");
            option.value = food.name;
            foodList.appendChild(option);
        });

    foodSelect.dataset.foodSearch = "true";


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
        foodList
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


        if (food && food.category === "dish") {

            row.dataset.amount = "1 dish";

            const configured = document.createElement("span");
            configured.className = "configured-dish-label";
            configured.textContent = "Configured dish";
            amountContainer.appendChild(configured);

        }

        else if (
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
        "input",
        function () {

            const match = foods.find(
                food => food.name.toLowerCase() === foodSelect.value.trim().toLowerCase()
            );

            row.dataset.food = match ? match.name : "";
            row.dataset.amount = "";

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


    if (amount === "1 dish" && food && food.category === "dish") {
        return Number(food.totalWeight || food.servingWeight || 0);
    }


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


function isDishFood(foodName) {
    const food = foods.find(item => item.name === foodName);
    return !!food && food.category === "dish";
}

function getDishNutrition(food) {
    if (!food || food.category !== "dish") return null;
    return {
        calories: Number(food.calories) || 0,
        protein: Number(food.protein) || 0,
        carbs: Number(food.carbs) || 0,
        fat: Number(food.fat) || 0,
        fibre: Number(food.fibre) || 0
    };
}

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

    updateRings(
        total
    );


    return total;

}


/* =========================================
   SUPPLEMENTS
   Supplements are tracked by the Daily Trackers checkbox.
========================================= */

function renderSupplements() {
    // Kept for compatibility with older calls.
    renderDailyTrackers();
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

        renderDailyTrackers();

        calculateTotals();

        loadWaterIntake();
        loadStepCount();
        renderProgressTrackers();

        updateRings();

        currentProgressDate =
            getElement("logDate").value ||
            getLocalDateString();

    }
);


/* =========================================
   SAVE FOOD DAY
========================================= */

getElement(
    "saveDayBtn"
).addEventListener(
    "click",
    async function () {

        const date =
            getElement("logDate").value;

        if (!date) {
            alert("Select a date first.");
            return;
        }

        /*
         * If this date was already saved and its calendar-day
         * editing window has expired, the meal-level record is read-only.
         */
        if (
            dailyLogMeta[date] &&
            !isDailyLogEditable(date)
        ) {
            alert(
                "This day's editing window has expired. " +
                "You can still open its Progress, but it can no longer be edited."
            );
            cleanupExpiredDailyFoodLogs();
            saveStorage();
            renderHistory();
            return;
        }

        /*
         * First SAVE establishes today's saved record.
         * Later saves update the same day's meal list until midnight.
         */
        if (!dailyLogMeta[date]) {
            dailyLogMeta[date] = {
                savedAt: new Date().toISOString()
            };
        }

        logs =
            logs.filter(
                item => item.date !== date
            );

        document
            .querySelectorAll(".meal-card")
            .forEach(card => {

                const meal =
                    card.dataset.meal;

                card
                    .querySelectorAll(".food-row")
                    .forEach(row => {

                        if (
                            row.dataset.food &&
                            row.dataset.amount
                        ) {
                            logs.push({
                                date,
                                meal,
                                food: row.dataset.food,
                                amount: row.dataset.amount
                            });
                        }
                    });
            });

        updateDailySummaryFromCurrentDay(date);

        await saveStorage();

        getElement("saveMessage").textContent =
            `Day saved. You can edit it until ${formatDailyDeadline(date)}.`;

        renderHistory();

        setTimeout(() => {
            getElement("saveMessage").textContent = "";
        }, 4000);
    }
);


/* =========================================
   NUTRITION PROGRESS / SAVED DAILY LOGS
========================================= */

function deleteDailyLog(date) {

    const ok = confirm(
        `Delete the saved Daily Log for ${date}?

All food entries and tracker values for this date will be reset.`
    );

    if (!ok) return;

    logs = logs.filter(item => item.date !== date);
    savedDates = savedDates.filter(savedDate => savedDate !== date);

    delete trackerLogs[date];
    delete supplementLogs[date];
    delete waterLogs[date];
    delete stepLogs[date];
    delete dailySummaries[date];
    delete dailyLogMeta[date];

    saveStorage();

    renderHistory();
    renderProgressAverages();
    renderDailyTrackers();
    renderProgressTrackers();
    renderMeals();
    calculateTotals();
    updateRings();
}

function renderProgressAverages() {

    const from =
        getElement("fromDate")?.value ||
        getLocalDateString();

    const to =
        getElement("toDate")?.value ||
        getLocalDateString();

    const dates =
        savedDates.filter(
            date =>
                date >= from &&
                date <= to
        );

    const dailyTotals =
        dates.map(
            date => getProgressTotals(date)
        );

    updateAverages(dailyTotals);
}

function renderHistory() {

    const from =
        getElement("dailyHistoryFromDate")?.value ||
        getElement("fromDate").value;

    const to =
        getElement("dailyHistoryToDate")?.value ||
        getElement("toDate").value;

    const history =
        getElement("historyList");

    history.innerHTML = "";

    cleanupExpiredDailyFoodLogs();

    const fromDateValue = from || "0000-01-01";
    const toDateValue = to || "9999-12-31";

    if (from && to && from > to) {
        history.innerHTML = `
            <p class="muted">From date cannot be after To date.</p>
        `;
        updateAverages([]);
        return;
    }

    const dates =
        savedDates
            .filter(date =>
                date >= fromDateValue &&
                date <= toDateValue
            )
            .sort()
            .reverse();

    if (dates.length === 0) {
        history.innerHTML = `
            <p class="muted">No saved Daily Logs in this date range.</p>
        `;
        updateAverages([]);
        return;
    }

    const dailyTotals = [];

    dates.forEach(date => {

        const total =
            getProgressTotals(date);

        dailyTotals.push(total);

        const row =
            document.createElement("div");

        row.className =
            "history-row daily-log-history-row";

        const info =
            document.createElement("div");

        const editable =
            isDailyLogEditable(date);

        const deadline =
            formatDailyDeadline(date);

        info.innerHTML = `
            <strong>${formatDisplayDate(date)}</strong><br>
            <span class="muted">
                ${total.calories.toFixed(0)} kcal ·
                ${total.protein.toFixed(1)} g protein ·
                ${total.fibre.toFixed(1)} g fibre
            </span>
            ${
                editable
                    ? `<small class="muted">Editable until ${deadline}</small>`
                    : `<small class="muted">Read-only history</small>`
            }
        `;

        const actions =
            document.createElement("div");

        actions.className =
            "history-actions";

        if (editable) {
            const editButton =
                document.createElement("button");

            editButton.type = "button";
            editButton.className = "history-open-btn";
            editButton.textContent = "Edit";

            editButton.addEventListener(
                "click",
                () => {
                    getElement("logDate").value = date;

                    document
                        .querySelector('[data-page="dailyPage"]')
                        .click();

                    renderMeals();
                    renderDailyTrackers();
                    loadWaterIntake();
                    loadStepCount();
                    calculateTotals();
                    updateRings();
                    renderHistory();
                }
            );

            actions.appendChild(editButton);
        }

        const openButton =
            document.createElement("button");

        openButton.type = "button";
        openButton.className = "history-open-btn";
        openButton.textContent = "Open";

        openButton.addEventListener(
            "click",
            () => {
                currentProgressDate = date;

                document
                    .querySelector('[data-page="progressPage"]')
                    .click();

                showProgressForDate(date);
            }
        );

        const deleteButton =
            document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "history-delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener(
            "click",
            event => {
                event.stopPropagation();
                deleteDailyLog(date);
            }
        );

        actions.append(
            openButton,
            deleteButton
        );

        row.append(
            info,
            actions
        );

        history.appendChild(row);
    });

    updateAverages(dailyTotals);
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
    renderProgressAverages
);

getElement("dailyHistoryFromDate")?.addEventListener("change", renderHistory);
getElement("dailyHistoryToDate")?.addEventListener("change", renderHistory);


getElement(
    "toDate"
).addEventListener(
    "change",
    renderProgressAverages
);



/* =========================================
   EXCEL BACKUP / RESTORE
========================================= */

function downloadBlob(
    blob,
    filename
) {
    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(
        () => URL.revokeObjectURL(url),
        1000
    );
}

function requireXLSX() {
    if (!window.XLSX) {
        alert(
            "Excel support is not loaded yet. " +
            "Please refresh the page and try again."
        );
        return false;
    }

    return true;
}

function exportFoodBackup() {
    if (!requireXLSX()) return;

    const workbook =
        XLSX.utils.book_new();

    const foodRows =
        foods.map(food => ({
            ID: food.id,
            Name: food.name,
            Category: food.category,
            Calories_per_100g: food.calories,
            Protein_per_100g: food.protein,
            Carbs_per_100g: food.carbs,
            Fat_per_100g: food.fat,
            Fibre_per_100g: food.fibre,
            Sugar_per_100g: food.sugar,
            Serving_Weight_g: food.servingWeight,
            Serving_Options:
                Array.isArray(food.servingOptions)
                    ? food.servingOptions.join(", ")
                    : "",
            Total_Dish_Weight_g:
                food.totalWeight || "",
            Dish_Ingredients:
                food.ingredients
                    ? JSON.stringify(food.ingredients)
                    : ""
        }));

    const sheet =
        XLSX.utils.json_to_sheet(foodRows);

    XLSX.utils.book_append_sheet(
        workbook,
        sheet,
        "Food Database"
    );

    XLSX.writeFile(
        workbook,
        `Nutrition_Foods_Backup_${getLocalDateString()}.xlsx`
    );
}

function exportPersonalBackup() {
    if (!requireXLSX()) return;

    const workbook =
        XLSX.utils.book_new();

    const dailyRows =
        Object.values(dailySummaries)
            .sort((a, b) =>
                String(a.date).localeCompare(String(b.date))
            )
            .map(item => ({
                Date: item.date,
                Calories: Number(item.calories) || 0,
                Protein_g: Number(item.protein) || 0,
                Fibre_g: Number(item.fibre) || 0,
                Carbs_g: Number(item.carbs) || 0,
                Fat_g: Number(item.fat) || 0,
                Water_L: Number(item.water) || 0,
                Steps: Number(item.steps) || 0,
                Gym: item.gym === true ? "Yes" : "No",
                Sugar_Taken: item.sugar === true ? "Yes" : "No",
                Main: item.main === true ? "Yes" : "No",
                Supplements: item.supplements === true ? "Yes" : "No",
                Weight_kg:
                    item.weight === null ||
                    item.weight === undefined
                        ? ""
                        : Number(item.weight)
            }));

    XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(dailyRows),
        "Daily Progress"
    );

    const weightRows =
        weightLogs.map(item => ({
            Date: item.date,
            Weight_kg: Number(item.weight) || 0
        }));

    XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(weightRows),
        "Weight"
    );

    const trackerRows =
        Object.entries(trackerLogs)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, values]) => ({
                Date: date,
                Gym: values?.gym === true ? "Yes" : "No",
                Sugar_Taken: values?.sugar === true ? "Yes" : "No",
                Main: values?.main === true ? "Yes" : "No",
                Supplements: values?.supplements === true ? "Yes" : "No"
            }));

    XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(trackerRows),
        "Trackers"
    );

    const targetRows = [{
        Protein_g: Number(targets.protein) || 120,
        Calories_kcal: Number(targets.calories) || 1200,
        Fibre_g: Number(targets.fibre) || 30,
        Water_L: Number(targets.water) || 3,
        Carbs_g: Number(targets.carbs) || 130,
        Fat_g: Number(targets.fat) || 60,
        Steps: Number(targets.steps) || 8000
    }];

    XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(targetRows),
        "Targets"
    );

    XLSX.writeFile(
        workbook,
        `Nutrition_Personal_Backup_${getLocalDateString()}.xlsx`
    );
}

function importFoodBackup(file) {
    if (!file || !requireXLSX()) return;

    const reader =
        new FileReader();

    reader.onload = function(event) {
        try {
            const workbook =
                XLSX.read(
                    event.target.result,
                    { type: "array" }
                );

            const sheet =
                workbook.Sheets["Food Database"] ||
                workbook.Sheets[workbook.SheetNames[0]];

            const rows =
                XLSX.utils.sheet_to_json(sheet);

            const imported =
                rows
                    .filter(row => row.Name)
                    .map(row => {
                        let ingredients = [];

                        if (row.Dish_Ingredients) {
                            try {
                                ingredients =
                                    JSON.parse(
                                        row.Dish_Ingredients
                                    );
                            } catch (_) {}
                        }

                        return {
                            id:
                                Number(row.ID) ||
                                Date.now() +
                                Math.random(),
                            name: String(row.Name),
                            category:
                                String(row.Category || "food"),
                            calories:
                                Number(row.Calories_per_100g) || 0,
                            protein:
                                Number(row.Protein_per_100g) || 0,
                            carbs:
                                Number(row.Carbs_per_100g) || 0,
                            fat:
                                Number(row.Fat_per_100g) || 0,
                            fibre:
                                Number(row.Fibre_per_100g) || 0,
                            sugar:
                                Number(row.Sugar_per_100g) || 0,
                            servingWeight:
                                Number(row.Serving_Weight_g) || 0,
                            servingOptions:
                                String(
                                    row.Serving_Options || ""
                                )
                                    .split(",")
                                    .map(x => x.trim())
                                    .filter(Boolean),
                            totalWeight:
                                Number(row.Total_Dish_Weight_g) || 0,
                            ingredients
                        };
                    });

            if (!imported.length) {
                alert("No food records were found in this Excel file.");
                return;
            }

            if (
                !confirm(
                    `Import ${imported.length} food/dish records? ` +
                    "This will replace your current Food Database."
                )
            ) {
                return;
            }

            foods = imported;
            saveStorage();
            renderFoodList();
            renderMeals();

            alert("Food Database imported successfully.");
        } catch (error) {
            console.error("Food Excel import failed:", error);
            alert("Could not import this Food Database Excel file.");
        }
    };

    reader.readAsArrayBuffer(file);
}

function importPersonalBackup(file) {
    if (!file || !requireXLSX()) return;

    const reader =
        new FileReader();

    reader.onload = function(event) {
        try {
            const workbook =
                XLSX.read(
                    event.target.result,
                    { type: "array" }
                );

            const dailySheet =
                workbook.Sheets["Daily Progress"];

            if (!dailySheet) {
                alert(
                    "This does not look like a Nutrition Personal Backup file."
                );
                return;
            }

            const dailyRows =
                XLSX.utils.sheet_to_json(
                    dailySheet
                );

            if (
                !confirm(
                    "Restore Personal Data from this Excel file? " +
                    "Your current daily summaries, trackers and weight history will be replaced."
                )
            ) {
                return;
            }

            dailySummaries = {};

            dailyRows.forEach(row => {
                if (!row.Date) return;

                dailySummaries[String(row.Date)] = {
                    date: String(row.Date),
                    calories: Number(row.Calories) || 0,
                    protein: Number(row.Protein_g) || 0,
                    fibre: Number(row.Fibre_g) || 0,
                    carbs: Number(row.Carbs_g) || 0,
                    fat: Number(row.Fat_g) || 0,
                    water: Number(row.Water_L) || 0,
                    gym: String(row.Gym).toLowerCase() === "yes",
                    sugar: String(row.Sugar_Taken).toLowerCase() === "yes",
                    main: String(row.Main).toLowerCase() === "yes",
                    supplements:
                        String(row.Supplements).toLowerCase() === "yes",
                    weight:
                        row.Weight_kg === ""
                            ? null
                            : Number(row.Weight_kg)
                };
            });

            savedDates =
                Object.keys(dailySummaries).sort();

            const trackerSheet =
                workbook.Sheets["Trackers"];

            trackerLogs = {};

            if (trackerSheet) {
                XLSX.utils.sheet_to_json(
                    trackerSheet
                ).forEach(row => {
                    if (!row.Date) return;

                    trackerLogs[String(row.Date)] = {
                        gym:
                            String(row.Gym).toLowerCase() === "yes",
                        sugar:
                            String(row.Sugar_Taken).toLowerCase() === "yes",
                        main:
                            String(row.Main).toLowerCase() === "yes",
                        supplements:
                            String(row.Supplements).toLowerCase() === "yes"
                    };
                });
            }

            const weightSheet =
                workbook.Sheets["Weight"];

            weightLogs = [];

            if (weightSheet) {
                XLSX.utils.sheet_to_json(
                    weightSheet
                ).forEach(row => {
                    if (!row.Date) return;

                    weightLogs.push({
                        id: Date.now() + Math.random(),
                        date: String(row.Date),
                        weight: Number(row.Weight_kg) || 0
                    });
                });
            }

            const targetSheet =
                workbook.Sheets["Targets"];

            if (targetSheet) {
                const rows =
                    XLSX.utils.sheet_to_json(
                        targetSheet
                    );

                if (rows[0]) {
                    targets = {
                        protein:
                            Number(rows[0].Protein_g) || 120,
                        calories:
                            Number(rows[0].Calories_kcal) || 1200,
                        fibre:
                            Number(rows[0].Fibre_g) || 30,
                        water:
                            Number(rows[0].Water_L) || 3
                    };
                }
            }

            /*
             * Imported personal data is historical. Do not create
             * editable meal-level records from Excel.
             */
            logs = [];
            dailyLogMeta = {};

            savedDates.forEach(date => {
                dailyLogMeta[date] = {
                    savedAt:
                        `${date}T00:00:00`
                };
            });

            saveStorage();

            loadTargetInputs();
            renderHistory();
            renderProgressAverages();
            renderProgressTrackers();
            renderWeightPage();
            showProgressForDate(
                getLocalDateString()
            );

            alert("Personal Data imported successfully.");
        } catch (error) {
            console.error("Personal Excel import failed:", error);
            alert("Could not import this Personal Data Excel file.");
        }
    };

    reader.readAsArrayBuffer(file);
}

getElement("exportFoodBtn")?.addEventListener(
    "click",
    exportFoodBackup
);

getElement("importFoodInput")?.addEventListener(
    "change",
    event => {
        importFoodBackup(event.target.files?.[0]);
        event.target.value = "";
    }
);

getElement("exportPersonalBtn")?.addEventListener(
    "click",
    exportPersonalBackup
);

getElement("importPersonalInput")?.addEventListener(
    "change",
    event => {
        importPersonalBackup(event.target.files?.[0]);
        event.target.value = "";
    }
);

/* =========================================
   FOOD CATEGORY + DISH BUILDER
========================================= */

function updateFoodCategoryUI() {

    document
        .querySelectorAll(".category-btn")
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.category === selectedCategory
            );
        });

    const foodForm = getElement("foodForm");
    const dishBuilder = getElement("dishBuilderCard");
    const servingBox = getElement("servingOptionsBox");
    const formTitle = getElement("formTitle");

    if (selectedCategory === "dish") {
        foodForm.style.display = "none";
        dishBuilder.style.display = "block";
        renderDishIngredients();
        calculateDishNutrition();
        return;
    }

    foodForm.style.display = "block";
    dishBuilder.style.display = "none";

    if (selectedCategory === "protein") {
        formTitle.textContent = "Add Protein Powder";
        servingBox.style.display = "block";
    } else {
        formTitle.textContent = "Add Food Item";
        servingBox.style.display = "none";
    }
}

document
    .querySelectorAll(".category-btn")
    .forEach(button => {
        button.addEventListener("click", function () {
            selectedCategory = button.dataset.category;
            editingFoodId = null;
            updateFoodCategoryUI();
            renderFoodList();
        });
    });

let editingDishId = null;
let dishIngredients = [];

function getDishFoodItems() {
    return foods.filter(food => food.category === "food");
}

function addDishIngredient(data = null) {
    const availableFoods = getDishFoodItems();
    if (availableFoods.length === 0) {
        getElement("dishEmptyFoodMessage").style.display = "block";
        return;
    }

    getElement("dishEmptyFoodMessage").style.display = "none";

    dishIngredients.push({
        foodName: data?.foodName || "",
        grams: Number(data?.grams) || 0
    });

    renderDishIngredients();
    calculateDishNutrition();
}

function renderDishIngredients() {
    const container = getElement("dishIngredients");
    if (!container) return;

    container.innerHTML = "";
    const availableFoods = getDishFoodItems();

    if (availableFoods.length === 0) {
        getElement("dishEmptyFoodMessage").style.display = "block";
        return;
    }

    getElement("dishEmptyFoodMessage").style.display = "none";

    dishIngredients.forEach((ingredient, index) => {
        const row = document.createElement("div");
        row.className = "dish-ingredient-row";

        const search = document.createElement("input");
        search.type = "search";
        search.className = "dish-food-search";
        search.placeholder = "Search food...";
        search.value = ingredient.foodName;

        const select = document.createElement("select");
        select.className = "dish-food-select";

        function fillOptions(filter = "") {
            const current = ingredient.foodName;
            const query = filter.trim().toLowerCase();
            select.innerHTML = `<option value="">Select Food Item</option>`;

            availableFoods
                .filter(food => !query || food.name.toLowerCase().includes(query))
                .forEach(food => {
                    const option = document.createElement("option");
                    option.value = food.name;
                    option.textContent = food.name;
                    select.appendChild(option);
                });

            select.value = current;
        }

        fillOptions(search.value);

        search.addEventListener("input", function () {
            fillOptions(search.value);
        });

        search.addEventListener("keydown", function (event) {
            if (event.key === "Enter") event.preventDefault();
        });

        select.addEventListener("change", function () {
            ingredient.foodName = select.value;
            search.value = select.value;
            calculateDishNutrition();
        });

        const quantity = document.createElement("input");
        quantity.type = "number";
        quantity.className = "dish-food-quantity";
        quantity.min = "0";
        quantity.step = "1";
        quantity.placeholder = "Quantity (g)";
        quantity.value = ingredient.grams || "";

        quantity.addEventListener("input", function () {
            ingredient.grams = Number(quantity.value) || 0;
            calculateDishNutrition();
        });

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "remove-btn dish-remove-btn";
        remove.textContent = "×";
        remove.title = "Remove food item";
        remove.addEventListener("click", function () {
            dishIngredients.splice(index, 1);
            renderDishIngredients();
            calculateDishNutrition();
        });

        row.append(search, select, quantity, remove);
        container.appendChild(row);
    });
}

function calculateDishNutrition() {
    const totals = {
        weight: 0,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fibre: 0
    };

    dishIngredients.forEach(ingredient => {
        const food = foods.find(
            item => item.category === "food" && item.name === ingredient.foodName
        );
        const grams = Number(ingredient.grams) || 0;
        if (!food || grams <= 0) return;

        const multiplier = grams / 100;
        totals.weight += grams;
        totals.calories += Number(food.calories || 0) * multiplier;
        totals.protein += Number(food.protein || 0) * multiplier;
        totals.carbs += Number(food.carbs || 0) * multiplier;
        totals.fat += Number(food.fat || 0) * multiplier;
        totals.fibre += Number(food.fibre || 0) * multiplier;
    });

    getElement("dishTotalWeight").textContent = totals.weight.toFixed(0);
    getElement("dishTotalCalories").textContent = totals.calories.toFixed(0);
    getElement("dishTotalProtein").textContent = totals.protein.toFixed(1);
    getElement("dishTotalCarbs").textContent = totals.carbs.toFixed(1);
    getElement("dishTotalFat").textContent = totals.fat.toFixed(1);
    getElement("dishTotalFibre").textContent = totals.fibre.toFixed(1);

    if (totals.weight > 0) {
        const factor = 100 / totals.weight;
        getElement("dishPer100Summary").textContent =
            `${(totals.calories * factor).toFixed(0)} kcal · ` +
            `${(totals.protein * factor).toFixed(1)} g protein · ` +
            `${(totals.carbs * factor).toFixed(1)} g carbs · ` +
            `${(totals.fat * factor).toFixed(1)} g fat · ` +
            `${(totals.fibre * factor).toFixed(1)} g fibre`;
    } else {
        getElement("dishPer100Summary").textContent =
            "0 kcal · 0 g protein · 0 g carbs · 0 g fat · 0 g fibre";
    }

    return totals;
}

function resetDishBuilder() {
    editingDishId = null;
    dishIngredients = [];
    getElement("dishName").value = "";
    getElement("dishMessage").textContent = "";
    getElement("saveDishBtn").textContent = "SAVE DISH";
    renderDishIngredients();
    calculateDishNutrition();
}

getElement("addDishIngredientBtn")?.addEventListener("click", function () {
    addDishIngredient();
});

getElement("cancelDishBtn")?.addEventListener("click", function () {
    resetDishBuilder();
});

getElement("saveDishBtn")?.addEventListener("click", function () {
    const name = getElement("dishName").value.trim();
    const totals = calculateDishNutrition();

    if (!name) {
        alert("Enter a dish name.");
        return;
    }

    const validIngredients = dishIngredients.filter(
        item => item.foodName && Number(item.grams) > 0
    );

    if (validIngredients.length === 0 || totals.weight <= 0) {
        alert("Add at least one food item and enter its quantity.");
        return;
    }

    const duplicate = foods.some(
        food =>
            food.id !== editingDishId &&
            food.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
        alert("A food or dish with this name already exists.");
        return;
    }

    const per100Factor = 100 / totals.weight;
    const dishData = {
        name,
        category: "dish",
        calories: totals.calories * per100Factor,
        protein: totals.protein * per100Factor,
        carbs: totals.carbs * per100Factor,
        fat: totals.fat * per100Factor,
        fibre: totals.fibre * per100Factor,
        sugar: 0,
        servingOptions: [],
        servingWeight: 0,
        totalWeight: totals.weight,
        ingredients: validIngredients.map(item => ({ ...item }))
    };

    if (editingDishId !== null) {
        const index = foods.findIndex(food => food.id === editingDishId);
        if (index !== -1) {
            foods[index] = { ...foods[index], ...dishData };
        }
        getElement("dishMessage").textContent = `${name} updated successfully.`;
    } else {
        foods.push({ id: Date.now(), ...dishData });
        getElement("dishMessage").textContent = `${name} added successfully.`;
    }

    saveStorage();
    renderFoodList();
    renderMeals();

    setTimeout(() => {
        resetDishBuilder();
        selectedCategory = "dish";
        updateFoodCategoryUI();
        renderFoodList();
    }, 600);
});

function startEditingDish(food) {
    selectedCategory = "dish";
    editingDishId = food.id;
    dishIngredients = (food.ingredients || []).map(item => ({
        foodName: item.foodName,
        grams: Number(item.grams) || 0
    }));

    updateFoodCategoryUI();
    getElement("dishName").value = food.name;
    getElement("saveDishBtn").textContent = "UPDATE DISH";
    renderDishIngredients();
    calculateDishNutrition();
    getElement("dishBuilderCard").scrollIntoView({ behavior: "smooth", block: "start" });
}

updateFoodCategoryUI();


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


        updateFoodCategoryUI();
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
            if (food.category === "dish") {
                startEditingDish(food);
            } else {
                startEditingFood(food);
            }
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

    selectedCategory = food.category;
    updateFoodCategoryUI();

    editingFoodId =
        food.id;


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

initializeAppData();
