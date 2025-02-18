
// Breyting fengin frá ChatGPT til þess að laga eslint villu tengt því að aldrei var kallað á checkAnswer 
// því HTML skrár eru afleiddar og scripts slóðin þar vísar ekki beint á þessa skrá,
// checkAnswer er mín eigin smíð. 
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("button[type='button']").forEach(button => {
        button.addEventListener("click", (event) => {
            checkAnswer(event.target);
        });
    });
});

function checkAnswer(buttonClicked) {
    const parentFieldset = buttonClicked.closest('fieldset');
    const selectedAnswer = parentFieldset.querySelector(`input:checked`);
    const infoText = parentFieldset.querySelector('.answer-box');

    if (!selectedAnswer) {
        infoText.textContent = "Veldu svar!!";
        infoText.style.color = "red";
        return;
    }

    const correctItem = selectedAnswer.closest('label');
    const isCorrect = correctItem.classList.contains('correct');

    if (isCorrect) {
        infoText.textContent = "Rétt svar, Vel gert!!";
        infoText.style.color = "green";
    } else {
        infoText.textContent = "Rangt svar, Reyndu aftur!!";
        infoText.style.color = "red";
    }
}