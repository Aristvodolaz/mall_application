document.addEventListener('DOMContentLoaded', () => {
    const seatsContainer = document.querySelector('.seats-container');
    const selectedSeatsText = document.getElementById('selectedSeatsText');
    const ticketsCount = document.getElementById('ticketsCount');
    const totalPrice = document.getElementById('totalPrice');
    const bookingButton = document.getElementById('bookingButton');
    const bookingSummary = document.querySelector('.booking-summary');
    
    let selectedSeats = [];

    // Загрузка схемы зала
    fetch(`/api/screenings/${screeningData.id}/seats`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderSeats(data.seats);
                bookingSummary.style.display = 'block';
            } else {
                showError('Не удалось загрузить схему зала');
            }
        })
        .catch(error => {
            console.error('Ошибка при загрузке схемы зала:', error);
            showError('Произошла ошибка при загрузке схемы зала');
        });

    function renderSeats(seats) {
        const loading = seatsContainer.querySelector('.seats-loading');
        if (loading) {
            loading.remove();
        }

        const seatsGrid = document.createElement('div');
        seatsGrid.className = 'seats-grid';

        seats.forEach((row, rowIndex) => {
            const rowElement = document.createElement('div');
            rowElement.className = 'seats-row';

            row.forEach((seat, seatIndex) => {
                const seatElement = document.createElement('div');
                seatElement.className = `seat ${seat.status}`;
                seatElement.dataset.row = rowIndex + 1;
                seatElement.dataset.seat = seatIndex + 1;

                if (seat.status === 'available') {
                    seatElement.addEventListener('click', () => toggleSeat(seatElement));
                }

                rowElement.appendChild(seatElement);
            });

            seatsGrid.appendChild(rowElement);
        });

        seatsContainer.appendChild(seatsGrid);
    }

    function toggleSeat(seatElement) {
        const row = seatElement.dataset.row;
        const seat = seatElement.dataset.seat;
        const seatInfo = { row, seat };

        if (seatElement.classList.contains('selected')) {
            seatElement.classList.remove('selected');
            selectedSeats = selectedSeats.filter(s => !(s.row === row && s.seat === seat));
        } else {
            seatElement.classList.add('selected');
            selectedSeats.push(seatInfo);
        }

        updateBookingSummary();
    }

    function updateBookingSummary() {
        const count = selectedSeats.length;
        const total = count * screeningData.basePrice;

        if (count > 0) {
            selectedSeatsText.textContent = selectedSeats
                .sort((a, b) => a.row - b.row || a.seat - b.seat)
                .map(s => `Ряд ${s.row}, Место ${s.seat}`)
                .join('; ');
            ticketsCount.textContent = count;
            totalPrice.textContent = total;
            bookingButton.disabled = false;
        } else {
            selectedSeatsText.textContent = '-';
            ticketsCount.textContent = '0';
            totalPrice.textContent = '0';
            bookingButton.disabled = true;
        }
    }

    function showError(message) {
        seatsContainer.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle-fill"></i>
                ${message}
            </div>
        `;
    }

    // Обработка нажатия кнопки бронирования
    bookingButton.addEventListener('click', () => {
        if (selectedSeats.length === 0) return;

        const bookingData = {
            screeningId: screeningData.id,
            seats: selectedSeats
        };

        fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = `/cinema/bookings/${data.bookingId}/payment`;
            } else {
                alert(data.message || 'Произошла ошибка при бронировании');
            }
        })
        .catch(error => {
            console.error('Ошибка при бронировании:', error);
            alert('Произошла ошибка при бронировании');
        });
    });
}); 