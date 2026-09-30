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
    localStorage.setItem("entriesSD", JSON.stringify(entries));
}


// --------------------------------------------------
// OUVRIR POUR AJOUTER
// --------------------------------------------------

openButton.addEventListener("click", () => {

    editingIndex = null;

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    dateInput.value = `${year}-${month}-${day}`;

    selectedCode = null;

    document.querySelectorAll(".code-button").forEach(button => {
        button.style.background = "";
    });

    saveButton.textContent = "Ajouter";

    modal.style.display = "flex";
});


// --------------------------------------------------
// CHOIX DU CODE
// --------------------------------------------------

document.querySelectorAll(".code-button").forEach(button => {

    button.addEventListener("click", () => {

        selectedCode = button.dataset.code;

        document.querySelectorAll(".code-button").forEach(b => {
            b.style.background = "";
        });

        button.style.background = "#dbeafe";
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
        alert("Veuillez choisir une date.");
        return;
    }

    if (!selectedCode) {
        alert("Veuillez choisir S ou D.");
        return;
    }


    const newEntry = {
        date: dateInput.value,
        code: selectedCode
    };


    // Modification

    if (editingIndex !== null) {

        entries[editingIndex] = newEntry;

    }

    // Nouvelle entrée

    else {

        entries.push(newEntry);

    }


    // Tri chronologique

    entries.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
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

        const row = document.createElement("tr");

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

        for (let i = index - 1; i >= 0; i--) {

            if (entries[i].code === entry.code) {

                const currentDate = new Date(entry.date);
                const previousDate = new Date(entries[i].date);

                const diff =
                    (currentDate - previousDate)
                    / (1000 * 60 * 60 * 24);

                difference = `${diff} j`;

                break;
            }
        }


        const row = document.createElement("tr");

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
            row.querySelector(".delete-button");

        deleteButton.addEventListener("click", (event) => {

            event.stopPropagation();

            deleteEntry(index);

        });


        tableBody.appendChild(row);

    });

}


// --------------------------------------------------
// MODIFIER
// --------------------------------------------------

function editEntry(index) {

    editingIndex = index;

    const entry = entries[index];

    dateInput.value = entry.date;

    selectedCode = entry.code;


    document.querySelectorAll(".code-button").forEach(button => {

        if (button.dataset.code === entry.code) {

            button.style.background = "#dbeafe";

        } else {

            button.style.background = "";

        }

    });


    saveButton.textContent = "Modifier";

    modal.style.display = "flex";

}


// --------------------------------------------------
// SUPPRIMER
// --------------------------------------------------

function deleteEntry(index) {

    if (!confirm("Supprimer cette entrée ?")) {
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
        entries.filter(entry => entry.code === code);

    const total = codeEntries.length;

    const daysId =
        code === "S" ? "daysS" : "daysD";


    // Total d'occurrences
    document.getElementById(totalId).textContent =
        total;


    // Aucune occurrence
    if (total === 0) {

        document.getElementById(daysId).textContent =
            "—";

        document.getElementById(averageId).textContent =
            "—";

        return;
    }


    // Première occurrence
    const firstDate =
        new Date(codeEntries[0].date);


    // Date du jour
    const today = new Date();

    today.setHours(0, 0, 0, 0);


    // Nombre de jours écoulés
    const difference =
        Math.floor(
            (today - firstDate)
            / (1000 * 60 * 60 * 24)
        );


    // Affichage des jours écoulés
    document.getElementById(daysId).textContent =
        `${difference} jours`;


    // Calcul de la moyenne
    const average =
        difference / total;


    document.getElementById(averageId).textContent =
        `${average.toFixed(1)} jours`;

}


// --------------------------------------------------
// FORMAT DATE
// --------------------------------------------------

function formatDate(date) {

    const parts = date.split("-");

    return `${parts[2]}/${parts[1]}/${parts[0].slice(2)}`;

}


// --------------------------------------------------
// INITIALISATION
// --------------------------------------------------

renderTable();
updateSummary();
// --------------------------------------------------
// EXPORT EXCEL
// --------------------------------------------------
// --------------------------------------------------
// EXPORT EXCEL
// --------------------------------------------------

document.getElementById("exportButton").addEventListener("click", () => {

    // Tableau principal
    const data = [
        ["Date", "Code", "Écart"]
    ];

    entries.forEach((entry, index) => {

        let difference = "";

        for (let i = index - 1; i >= 0; i--) {

            if (entries[i].code === entry.code) {

                const currentDate = new Date(entry.date);
                const previousDate = new Date(entries[i].date);

                difference =
                    (currentDate - previousDate)
                    / (1000 * 60 * 60 * 24);

                break;
            }
        }

        data.push([
            formatDate(entry.date),
            entry.code,
            difference === "" ? "" : difference
        ]);

    });


    // Récapitulatif
    data.push([]);
    data.push(["RÉCAPITULATIF"]);
    data.push(["Code", "Moyenne", "Total"]);

    ["S", "D"].forEach(code => {

        const codeEntries =
            entries.filter(entry => entry.code === code);

        const total = codeEntries.length;

        let average = 0;

        if (total > 1) {

            const firstDate =
                new Date(codeEntries[0].date);

            const lastDate =
                new Date(codeEntries[total - 1].date);

            const difference =
                (lastDate - firstDate)
                / (1000 * 60 * 60 * 24);

            average = difference / total;
        }

        data.push([
            code,
            average,
            total
        ]);

    });


    // Création du fichier Excel
    const worksheet =
        XLSX.utils.aoa_to_sheet(data);

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

});