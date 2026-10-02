const modal = document.getElementById("modal");
const openButton = document.querySelector(".add-button");
const cancelButton = document.getElementById("cancelButton");
const saveButton = document.getElementById("addButton");

const dateInput = document.getElementById("dateInput");
const tableBody = document.querySelector("tbody");

let entries = JSON.parse(localStorage.getItem("entriesSD")) || [];

let selectedCode = null;
let editingIndex = null;


// --------------------------------------------------
// SAUVEGARDE
// --------------------------------------------------

function saveData() {

    localStorage.setItem(
        "entriesSD",
        JSON.stringify(entries)
    );

}


// --------------------------------------------------
// CALCUL DE DIFFÉRENCE DE JOURS
// --------------------------------------------------
//
// 20 → 25 = 5
// 20 → 21 = 1
// 20 → 20 = 0
//
// On utilise uniquement les dates calendaires.
// --------------------------------------------------

function differenceInDays(startDate, endDate) {

    const start =
        new Date(startDate + "T00:00:00");

    const end =
        new Date(endDate + "T00:00:00");


    return Math.round(
        (end - start)
        /
        (1000 * 60 * 60 * 24)
    );

}


// --------------------------------------------------
// OUVRIR POUR AJOUTER
// --------------------------------------------------

openButton.addEventListener("click", () => {

    editingIndex = null;

    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(today.getMonth() + 1)
        .padStart(2, "0");

    const day =
        String(today.getDate())
        .padStart(2, "0");


    dateInput.value =
        `${year}-${month}-${day}`;


    selectedCode = null;


    document
        .querySelectorAll(".code-button")
        .forEach(button => {

            button.style.background = "";

        });


    saveButton.textContent = "Ajouter";

    modal.style.display = "flex";

});


// --------------------------------------------------
// CHOIX DU CODE
// --------------------------------------------------

document
    .querySelectorAll(".code-button")
    .forEach(button => {

        button.addEventListener("click", () => {

            selectedCode =
                button.dataset.code;


            document
                .querySelectorAll(".code-button")
                .forEach(b => {

                    b.style.background = "";

                });


            button.style.background =
                "#dbeafe";

        });

    });


// --------------------------------------------------
// ANNULER
// --------------------------------------------------

cancelButton.addEventListener("click", () => {

    modal.style.display = "none";

});


// --------------------------------------------------
// AJOUTER OU MODIFIER
// --------------------------------------------------

saveButton.addEventListener("click", () => {

    if (!dateInput.value) {

        alert(
            "Veuillez choisir une date."
        );

        return;
    }


    if (!selectedCode) {

        alert(
            "Veuillez choisir S ou D."
        );

        return;
    }


    const newEntry = {

        date: dateInput.value,

        code: selectedCode

    };


    // Modification

    if (editingIndex !== null) {

        entries[editingIndex] =
            newEntry;

    }


    // Nouvelle entrée

    else {

        entries.push(newEntry);

    }


    // Tri chronologique

    entries.sort((a, b) => {

        return new Date(a.date) -
               new Date(b.date);

    });


    saveData();

    renderTable();

    updateSummary();


    modal.style.display = "none";

});


// --------------------------------------------------
// AFFICHER LE TABLEAU
// --------------------------------------------------

function renderTable() {

    tableBody.innerHTML = "";


    if (entries.length === 0) {

        const row =
            document.createElement("tr");


        row.innerHTML = `
            <td colspan="4" class="empty">
                Aucune donnée
            </td>
        `;


        tableBody.appendChild(row);

        return;
    }


    entries.forEach((entry, index) => {

        let difference = "—";


        // Recherche de la précédente occurrence
        // du même code

        for (
            let i = index - 1;
            i >= 0;
            i--
        ) {

            if (
                entries[i].code ===
                entry.code
            ) {

                const diff =
                    differenceInDays(
                        entries[i].date,
                        entry.date
                    );


                difference =
                    `${diff} j`;


                break;

            }

        }


        const row =
            document.createElement("tr");


        row.innerHTML = `
            <td>${formatDate(entry.date)}</td>
            <td><strong>${entry.code}</strong></td>
            <td>${difference}</td>
            <td>
                <button class="delete-button">
                    ×
                </button>
            </td>
        `;


        // Cliquer sur la ligne = modifier

        row.addEventListener("click", () => {

            editEntry(index);

        });


        // Bouton supprimer

        const deleteButton =
            row.querySelector(
                ".delete-button"
            );


        deleteButton.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                deleteEntry(index);

            }
        );


        tableBody.appendChild(row);

    });

}


// --------------------------------------------------
// MODIFIER
// --------------------------------------------------

function editEntry(index) {

    editingIndex = index;


    const entry =
        entries[index];


    dateInput.value =
        entry.date;


    selectedCode =
        entry.code;


    document
        .querySelectorAll(".code-button")
        .forEach(button => {

            if (
                button.dataset.code ===
                entry.code
            ) {

                button.style.background =
                    "#dbeafe";

            } else {

                button.style.background =
                    "";

            }

        });


    saveButton.textContent =
        "Modifier";


    modal.style.display =
        "flex";

}


// --------------------------------------------------
// SUPPRIMER
// --------------------------------------------------

function deleteEntry(index) {

    if (
        !confirm(
            "Supprimer cette entrée ?"
        )
    ) {

        return;

    }


    entries.splice(index, 1);


    saveData();

    renderTable();

    updateSummary();

}


// --------------------------------------------------
// MOYENNES ET TOTAUX
// --------------------------------------------------

function updateSummary() {

    updateCodeSummary(
        "S",
        "averageS",
        "totalS"
    );


    updateCodeSummary(
        "D",
        "averageD",
        "totalD"
    );

}


function updateCodeSummary(
    code,
    averageId,
    totalId
) {

    const codeEntries =
        entries.filter(
            entry =>
                entry.code === code
        );


    const total =
        codeEntries.length;


    const daysId =
        code === "S"
            ? "daysS"
            : "daysD";


    // Total d'occurrences

    document
        .getElementById(totalId)
        .textContent = total;


    // Aucune occurrence

    if (total === 0) {

        document
            .getElementById(daysId)
            .textContent = "—";


        document
            .getElementById(averageId)
            .textContent = "—";


        return;

    }


    // --------------------------------------------------
    // TRI DES OCCURRENCES
    // --------------------------------------------------

    codeEntries.sort((a, b) => {

        return new Date(a.date) -
               new Date(b.date);

    });


    // --------------------------------------------------
    // DERNIÈRE OCCURRENCE
    // --------------------------------------------------

    const lastDate =
        codeEntries[
            codeEntries.length - 1
        ].date;


    // Date du jour au format YYYY-MM-DD

    const today =
        new Date();

    const todayString =
        `${today.getFullYear()}-` +
        `${String(today.getMonth() + 1).padStart(2, "0")}-` +
        `${String(today.getDate()).padStart(2, "0")}`;


    // Nombre de jours depuis
    // la DERNIÈRE occurrence

    const differenceSinceLast =
        differenceInDays(
            lastDate,
            todayString
        );


    // Affichage des jours

    document
        .getElementById(daysId)
        .textContent =
            `${differenceSinceLast} jours`;


    // --------------------------------------------------
    // MOYENNE
    // --------------------------------------------------
    //
    // (date du jour - première occurrence)
    // / nombre d'occurrences
    //
    // Avec le nouveau calcul :
    // 20 → 25 = 5
    // --------------------------------------------------

    const firstDate =
        codeEntries[0].date;


    const differenceSinceFirst =
        differenceInDays(
            firstDate,
            todayString
        );


    const average =
        differenceSinceFirst /
        total;


    document
        .getElementById(averageId)
        .textContent =
            `${average.toFixed(1)} jours`;

}


// --------------------------------------------------
// FORMAT DATE
// --------------------------------------------------

function formatDate(date) {

    const parts =
        date.split("-");


    return `
        ${parts[2]}/${parts[1]}/${parts[0].slice(2)}
    `;

}


// --------------------------------------------------
// INITIALISATION
// --------------------------------------------------

renderTable();

updateSummary();


// --------------------------------------------------
// EXPORT EXCEL
// --------------------------------------------------

document
    .getElementById("exportButton")
    .addEventListener(
        "click",
        () => {

            // Tableau principal

            const data = [
                ["Date", "Code", "Écart"]
            ];


            entries.forEach(
                (entry, index) => {

                    let difference = "";


                    for (
                        let i = index - 1;
                        i >= 0;
                        i--
                    ) {

                        if (
                            entries[i].code ===
                            entry.code
                        ) {

                            difference =
                                differenceInDays(
                                    entries[i].date,
                                    entry.date
                                );


                            break;

                        }

                    }


                    data.push([
                        formatDate(
                            entry.date
                        ),

                        entry.code,

                        difference === ""
                            ? ""
                            : difference
                    ]);

                }
            );


            // --------------------------------------------------
            // RÉCAPITULATIF
            // --------------------------------------------------

            data.push([]);

            data.push([
                "RÉCAPITULATIF"
            ]);

            data.push([
                "Code",
                "Moyenne",
                "Total"
            ]);


            // Date du jour

            const today =
                new Date();

            const todayString =
                `${today.getFullYear()}-` +
                `${String(today.getMonth() + 1).padStart(2, "0")}-` +
                `${String(today.getDate()).padStart(2, "0")}`;


            ["S", "D"].forEach(
                code => {

                    const codeEntries =
                        entries.filter(
                            entry =>
                                entry.code ===
                                code
                        );


                    const total =
                        codeEntries.length;


                    let average = 0;


                    if (total > 0) {

                        codeEntries.sort(
                            (a, b) => {

                                return new Date(a.date) -
                                       new Date(b.date);

                            }
                        );


                        const firstDate =
                            codeEntries[0].date;


                        const difference =
                            differenceInDays(
                                firstDate,
                                todayString
                            );


                        average =
                            difference /
                            total;

                    }


                    data.push([
                        code,
                        average,
                        total
                    ]);

                }
            );


            // --------------------------------------------------
            // CRÉATION DU FICHIER EXCEL
            // --------------------------------------------------

            const worksheet =
                XLSX.utils.aoa_to_sheet(
                    data
                );


            const workbook =
                XLSX.utils.book_new();


            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "Suivi S-D"
            );


            // Largeur des colonnes

            worksheet["!cols"] = [

                { wch: 15 },

                { wch: 10 },

                { wch: 12 }

            ];


            // Téléchargement

            XLSX.writeFile(
                workbook,
                "suivi-S-D.xlsx"
            );

        }
    );


// --------------------------------------------------
// IMPORT EXCEL
// --------------------------------------------------

const importButton =
    document.getElementById(
        "importButton"
    );


const importFile =
    document.getElementById(
        "importFile"
    );


importButton.addEventListener(
    "click",
    function () {

        importFile.click();

    }
);


importFile.addEventListener(
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
            function (event) {

                try {

                    const workbook =
                        XLSX.read(
                            event.target.result,
                            {
                                type: "array"
                            }
                        );


                    const sheet =
                        workbook.Sheets[
                            workbook.SheetNames[0]
                        ];


                    const rows =
                        XLSX.utils.sheet_to_json(
                            sheet,
                            {
                                header: 1
                            }
                        );


                    const importedEntries = [];


                    // Lire les lignes du tableau

                    for (
                        let i = 1;
                        i < rows.length;
                        i++
                    ) {

                        const row =
                            rows[i];


                        if (
                            !row ||
                            !row[0] ||
                            !row[1]
                        ) {

                            continue;

                        }


                        let date =
                            row[0];


                        let code =
                            String(row[1])
                                .trim()
                                .toUpperCase();


                        // Date Excel

                        if (
                            typeof date ===
                            "number"
                        ) {

                            const excelDate =
                                new Date(
                                    Date.UTC(
                                        1899,
                                        11,
                                        30
                                    )
                                    +
                                    date *
                                    86400000
                                );


                            const year =
                                excelDate
                                    .getUTCFullYear();


                            const month =
                                String(
                                    excelDate
                                        .getUTCMonth()
                                        + 1
                                )
                                .padStart(
                                    2,
                                    "0"
                                );


                            const day =
                                String(
                                    excelDate
                                        .getUTCDate()
                                )
                                .padStart(
                                    2,
                                    "0"
                                );


                            date =
                                `${year}-${month}-${day}`;

                        }


                        // Date JJ/MM/AA

                        else if (
                            typeof date ===
                                "string" &&
                            date.includes("/")
                        ) {

                            const parts =
                                date.split("/");


                            if (
                                parts.length === 3
                            ) {

                                let year =
                                    parts[2];


                                if (
                                    year.length === 2
                                ) {

                                    year =
                                        "20" +
                                        year;

                                }


                                date =
                                    `${year}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;

                            }

                        }


                        if (
                            (
                                code === "S" ||
                                code === "D"
                            )
                            &&
                            /^\d{4}-\d{2}-\d{2}$/
                                .test(date)
                        ) {

                            importedEntries.push({

                                date: date,

                                code: code

                            });

                        }

                    }


                    if (
                        importedEntries.length === 0
                    ) {

                        alert(
                            "Aucune entrée valide n'a été trouvée."
                        );

                        return;

                    }


                    if (
                        !confirm(
                            "Importer " +
                            importedEntries.length +
                            " entrées ?\n\n" +
                            "Les données actuelles seront remplacées."
                        )
                    ) {

                        return;

                    }


                    entries =
                        importedEntries;


                    // Tri chronologique

                    entries.sort(
                        function (a, b) {

                            return (
                                new Date(a.date) -
                                new Date(b.date)
                            );

                        }
                    );


                    // Sauvegarde

                    saveData();


                    // Actualisation

                    renderTable();

                    updateSummary();


                    alert(
                        "Import terminé avec succès."
                    );

                }


                catch (error) {

                    console.error(error);


                    alert(
                        "Une erreur est survenue lors de l'import."
                    );

                }

            };


        reader.readAsArrayBuffer(file);


        // Permet de sélectionner
        // à nouveau le même fichier

        event.target.value = "";

    }
);