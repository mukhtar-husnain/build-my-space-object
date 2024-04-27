// UI for draw button
const drawButton = document.createElement('button');
drawButton.textContent = 'Draw';
document.body.appendChild(drawButton);
drawButton.addEventListener('click', function () {
    isDrawing = !isDrawing;
});