const modal = document.getElementById("modal");
const openButton = document.querySelector(".add-button");
const cancelButton = document.getElementById("cancelButton");
const saveButton = document.getElementById("addButton");

const dateInput = document.getElementById("dateInput");
const tableBody = document.querySelector("tbody");

const importButton = document.getElementById("importButton");
const fileInput = document.getElementById("fileInput");

let entries = JSON.parse(localStorage.getItem("entriesSD")) || [];

let selectedCode = null;
let editingIndex = null;


// ============================================================
// SAUVEGARDE
// ============================================================

function saveData() {
    localStorage.setItem("entriesSD", JSON.stringify(entries));
}


// ============================================================
// CALCUL DE DIFFÉRENCE DE JOURS
// ============================================================
//
// 20 → 25 = 5 jours
// 20 → 21 = 1 jour
// 20 → 20 = 0 jour
//
// Les heures ne sont pas prises en compte.
// ============================================================

function differenceInDays(startDate, endDate) {

    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");

    return Math.round(
        (end - start) / (1000 * 60 * 60 * 24)
    );
}


// ============================================================
// DATE DU JOUR
// ============================================================

function getToday() {

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// ============================================================
// FORMATAGE DATE
// ============================================================

function formatDate(date) {

    const parts = date.split("-");

    return `${parts[2]}/${parts[1]}/${parts[0].slice(2)}`;
}


// ============================================================
// OUVERTURE DE LA FENÊTRE AJOUT
// ============================================================

openButton.addEventListener("click", function () {

    editingIndex = null;
    selectedCode = null;

    dateInput.value = getToday();

    document.querySelectorAll(".code-button").forEach(button => {
        button.classList.remove("selected");
    });

    saveButton.textContent = "Ajouter";

    modal.classList.add("show");
});


// ============================================================
// SÉLECTION DU CODE S / D
// ============================================================

document.querySelectorAll(".code-button").forEach(button => {

    button.addEventListener("click", function () {

        document.querySelectorAll(".code-button").forEach(btn => {
            btn.classList.remove("selected");
        });

        this.classList.add("selected");

        selectedCode = this.dataset.code;
    });

});


// ============================================================
// ANNULER
// ============================================================

cancelButton.addEventListener("click", function () {

    modal.classList.remove("show");

    editingIndex = null;
    selectedCode = null;
});


// ============================================================
// AJOUT / MODIFICATION
// ============================================================

saveButton.addEventListener("click", function () {

    const date = dateInput.value;

    if (!date) {
        alert("Veuillez sélectionner une date.");
        return;
    }

    if (!selectedCode) {
        alert("Veuillez sélectionner S ou D.");
        return;
    }


    // Modification
    if (editingIndex !== null) {

        entries[editingIndex] = {
            date: date,
            code: selectedCode
        };

    }

    // Nouvelle entrée
    else {

        entries.push({
            date: date,
            code: selectedCode
        });

    }


    // Tri chronologique
    entries.sort((a, b) => {
        return a.date.localeCompare(b.date);
    });


    saveData();

    renderTable();
    updateSummary();

    modal.classList.remove("show");

    editingIndex = null;
    selectedCode = null;
});


// ============================================================
// AFFICHAGE DU TABLEAU
// ============================================================

function renderTable() {

    tableBody.innerHTML = "";

    entries.forEach((entry, index) => {

        const row = document.createElement("tr");


        // ----------------------------------------------------
        // DATE
        // ----------------------------------------------------

        const dateCell = document.createElement("td");

        dateCell.textContent = formatDate(entry.date);

        row.appendChild(dateCell);


        // ----------------------------------------------------
        // CODE
        // ----------------------------------------------------

        const codeCell = document.createElement("td");

        codeCell.textContent = entry.code;

        row.appendChild(codeCell);


        // ----------------------------------------------------
        // ÉCART
        // ----------------------------------------------------

        const differenceCell = document.createElement("td");

        let previousDate = null;

        for (let i = index - 1; i >= 0; i--) {

            if (entries[i].code === entry.code) {

                previousDate = entries[i].date;

                break;
            }
        }


        if (previousDate) {

            const difference = differenceInDays(
                previousDate,
                entry.date
            );

            differenceCell.textContent = `${difference} j`;

        }
        else {

            differenceCell.textContent = "—";

        }

        row.appendChild(differenceCell);


        // ----------------------------------------------------
        // SUPPRESSION
        // ----------------------------------------------------

        const deleteCell = document.createElement("td");

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "×";

        deleteButton.className = "delete-button";

        deleteButton.addEventListener("click", function (event) {

            event.stopPropagation();

            deleteEntry(index);

        });

        deleteCell.appendChild(deleteButton);

        row.appendChild(deleteCell);


        // ----------------------------------------------------
        // MODIFICATION EN CLIQUANT SUR LA LIGNE
        // ----------------------------------------------------

        row.addEventListener("click", function () {

            editEntry(index);

        });


        tableBody.appendChild(row);
    });
}


// ============================================================
// MODIFIER UNE ENTRÉE
// ============================================================

function editEntry(index) {

    const entry = entries[index];

    editingIndex = index;

    selectedCode = entry.code;

    dateInput.value = entry.date;


    document.querySelectorAll(".code-button").forEach(button => {

        button.classList.remove("selected");

        if (button.dataset.code === entry.code) {
            button.classList.add("selected");
        }

    });


    saveButton.textContent = "Modifier";

    modal.classList.add("show");
}


// ============================================================
// SUPPRIMER UNE ENTRÉE
// ============================================================

function deleteEntry(index) {

    if (!confirm("Supprimer cette entrée ?")) {
        return;
    }

    entries.splice(index, 1);

    saveData();

    renderTable();

    updateSummary();
}


// ============================================================
// MISE À JOUR DES RÉSUMÉS
// ============================================================

function updateSummary() {

    updateCodeSummary("S");
    updateCodeSummary("D");
}


// ============================================================
// RÉSUMÉ S / D
// ============================================================

function updateCodeSummary(code) {

    const codeEntries = entries.filter(entry => {
        return entry.code === code;
    });


    const daysElement =
        document.getElementById(`days${code}`);

    const totalElement =
        document.getElementById(`total${code}`);

    const averageElement =
        document.getElementById(`average${code}`);


    // --------------------------------------------------------
    // AUCUNE ENTRÉE
    // --------------------------------------------------------

    if (codeEntries.length === 0) {

        daysElement.textContent = "—";

        totalElement.textContent = "0";

        averageElement.textContent = "—";

        return;
    }


    // --------------------------------------------------------
    // TRI DES DATES
    // --------------------------------------------------------

    codeEntries.sort((a, b) => {
        return a.date.localeCompare(b.date);
    });


    const firstDate =
        codeEntries[0].date;

    const lastDate =
        codeEntries[codeEntries.length - 1].date;

    const today =
        getToday();


    // --------------------------------------------------------
    // JOURS DEPUIS LA DERNIÈRE OCCURRENCE
    // --------------------------------------------------------

    const daysSinceLast =
        differenceInDays(
            lastDate,
            today
        );


    daysElement.textContent =
        daysSinceLast;


    // --------------------------------------------------------
    // TOTAL
    // --------------------------------------------------------

    const total =
        codeEntries.length;

    totalElement.textContent =
        total;


    // --------------------------------------------------------
    // MOYENNE
    // --------------------------------------------------------

    const totalDays =
        differenceInDays(
            firstDate,
            today
        );


    const average =
        totalDays / total;


    averageElement.textContent =
        average.toFixed(1);
}


// ============================================================
// EXPORT EXCEL
// ============================================================

document.getElementById("exportButton").addEventListener(
    "click",
    function () {

        const worksheetData = [];


        // ----------------------------------------------------
        // EN-TÊTES
        // ----------------------------------------------------

        worksheetData.push([
            "Date",
            "Code",
            "Écart"
        ]);


        // ----------------------------------------------------
        // DONNÉES
        // ----------------------------------------------------

        entries.forEach((entry, index) => {

            let previousDate = null;

            for (let i = index - 1; i >= 0; i--) {

                if (entries[i].code === entry.code) {

                    previousDate =
                        entries[i].date;

                    break;
                }
            }


            let difference = "";


            if (previousDate) {

                difference =
                    differenceInDays(
                        previousDate,
                        entry.date
                    );
            }


            worksheetData.push([
                formatDate(entry.date),
                entry.code,
                difference
            ]);

        });


        // ----------------------------------------------------
        // RÉCAPITULATIF
        // ----------------------------------------------------

        worksheetData.push([]);

        worksheetData.push([
            "RÉCAPITULATIF"
        ]);

        worksheetData.push([
            "Code",
            "Moyenne",
            "Total"
        ]);


        ["S", "D"].forEach(code => {

            const codeEntries =
                entries.filter(entry => {
                    return entry.code === code;
                });


            if (codeEntries.length === 0) {

                worksheetData.push([
                    code,
                    "",
                    0
                ]);

                return;
            }


            codeEntries.sort((a, b) => {
                return a.date.localeCompare(b.date);
            });


            const firstDate =
                codeEntries[0].date;

            const today =
                getToday();


            const totalDays =
                differenceInDays(
                    firstDate,
                    today
                );


            const average =
                totalDays / codeEntries.length;


            worksheetData.push([
                code,
                Number(average.toFixed(1)),
                codeEntries.length
            ]);

        });


        // ----------------------------------------------------
        // CRÉATION DU FICHIER
        // ----------------------------------------------------

        const worksheet =
            XLSX.utils.aoa_to_sheet(
                worksheetData
            );

        const workbook =
            XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "S-D"
        );


        XLSX.writeFile(
            workbook,
            "suivi-S-D.xlsx"
        );
    }
);


// ============================================================
// IMPORT EXCEL
// ============================================================

importButton.addEventListener(
    "click",
    function () {

        fileInput.click();

    }
);


fileInput.addEventListener(
    "change",
    function (event) {

        const file =
            event.target.files[0];


        if (!file) {
            return;
        }


        const reader =
            new FileReader();


        reader.onload =
            function (e) {

                try {

                    const data =
                        new Uint8Array(
                            e.target.result
                        );


                    const workbook =
                        XLSX.read(
                            data,
                            {
                                type: "array"
                            }
                        );


                    const sheetName =
                        workbook.SheetNames[0];


                    const worksheet =
                        workbook.Sheets[sheetName];


                    const rows =
                        XLSX.utils.sheet_to_json(
                            worksheet,
                            {
                                header: 1,
                                defval: ""
                            }
                        );


                    const importedEntries = [];


                    // ----------------------------------------
                    // LECTURE DES LIGNES
                    // ----------------------------------------

                    for (
                        let i = 1;
                        i < rows.length;
                        i++
                    ) {

                        const row =
                            rows[i];


                        if (
                            !row ||
                            row.length < 2
                        ) {
                            continue;
                        }


                        let dateValue =
                            row[0];

                        let codeValue =
                            row[1];


                        // ------------------------------------
                        // CODE
                        // ------------------------------------

                        if (
                            typeof codeValue === "string"
                        ) {

                            codeValue =
                                codeValue
                                    .trim()
                                    .toUpperCase();
                        }


                        if (
                            codeValue !== "S" &&
                            codeValue !== "D"
                        ) {

                            continue;
                        }


                        // ------------------------------------
                        // DATE
                        // ------------------------------------

                        let date = null;


                        // Date Excel numérique
                        if (
                            typeof dateValue === "number"
                        ) {

                            const excelDate =
                                XLSX.SSF.parse_date_code(
                                    dateValue
                                );


                            if (excelDate) {

                                const year =
                                    excelDate.y;

                                const month =
                                    String(
                                        excelDate.m
                                    ).padStart(2, "0");

                                const day =
                                    String(
                                        excelDate.d
                                    ).padStart(2, "0");


                                date =
                                    `${year}-${month}-${day}`;
                            }
                        }


                        // Date texte
                        else if (
                            typeof dateValue === "string"
                        ) {

                            const value =
                                dateValue.trim();


                            // JJ/MM/AA
                            // JJ/MM/AAAA
                            const match =
                                value.match(
                                    /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/
                                );


                            if (match) {

                                const day =
                                    match[1].padStart(
                                        2,
                                        "0"
                                    );


                                const month =
                                    match[2].padStart(
                                        2,
                                        "0"
                                    );


                                let year =
                                    match[3];


                                if (
                                    year.length === 2
                                ) {

                                    year =
                                        "20" + year;
                                }


                                date =
                                    `${year}-${month}-${day}`;
                            }
                        }


                        // ------------------------------------
                        // AJOUT
                        // ------------------------------------

                        if (date) {

                            importedEntries.push({
                                date: date,
                                code: codeValue
                            });

                        }
                    }


                    // ----------------------------------------
                    // VÉRIFICATION
                    // ----------------------------------------

                    if (
                        importedEntries.length === 0
                    ) {

                        alert(
                            "Aucune donnée S/D valide n'a été trouvée dans le fichier."
                        );

                        return;
                    }


                    // ----------------------------------------
                    // TRI
                    // ----------------------------------------

                    importedEntries.sort(
                        (a, b) => {
                            return a.date.localeCompare(
                                b.date
                            );
                        }
                    );


                    // ----------------------------------------
                    // REMPLACEMENT DES DONNÉES
                    // ----------------------------------------

                    entries =
                        importedEntries;


                    saveData();

                    renderTable();

                    updateSummary();


                    alert(
                        `${entries.length} entrée(s) importée(s).`
                    );

                }

                catch (error) {

                    console.error(
                        "Erreur lors de l'importation :",
                        error
                    );


                    alert(
                        "Une erreur est survenue lors de l'importation du fichier Excel."
                    );

                }

                finally {

                    // Permet de sélectionner à nouveau
                    // le même fichier
                    fileInput.value = "";
                }
            };


        reader.readAsArrayBuffer(file);

    }
);


// ============================================================
// INITIALISATION
// ============================================================

renderTable();

updateSummary();