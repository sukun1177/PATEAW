document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".categories button");
  const cards = document.querySelectorAll(".card");
  const searchInput = document.querySelector(".search-box input");
  const noResults = document.getElementById("noResults");

  let activeCategory = "ทั้งหมด";

  function filterCards() {
    const searchText = searchInput
      ? searchInput.value.toLowerCase().trim()
      : "";
    let visibleCount = 0;

    cards.forEach((card) => {
      const category = card.dataset.category || "";
      const title = card.querySelector("h3")
        ? card.querySelector("h3").textContent.toLowerCase()
        : "";
      const location = card.querySelector(".location")
        ? card.querySelector(".location").textContent.toLowerCase()
        : "";
      const descEl =
        card.querySelector(".description") || card.querySelector("p");
      const description = descEl ? descEl.textContent.toLowerCase() : "";

      const matchesCategory =
        activeCategory === "ทั้งหมด" || category === activeCategory;
      const matchesSearch =
        !searchText ||
        title.includes(searchText) ||
        location.includes(searchText) ||
        description.includes(searchText);

      if (matchesCategory && matchesSearch) {
        card.style.display = "block";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    if (noResults) {
      noResults.style.display = visibleCount === 0 ? "block" : "none";
    }
  }

  // การคัดกรองตามหมวดหมู่
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      buttons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      activeCategory = this.dataset.category || "ทั้งหมด";
      filterCards();
    });
  });

  // การคัดกรองตามคำค้นหาแบบเรียลไทม์
  if (searchInput) {
    searchInput.addEventListener("input", filterCards);
    searchInput.addEventListener("keyup", filterCards);
  }

  // จัดการป๊อบอัพพรีวิวรูปภาพแบบลอย (แสดงเฉพาะรูปภาพ)
  const popup = document.getElementById("previewPopup");
  if (popup) {
    const previewImg = document.getElementById("previewImg");

    cards.forEach((card) => {
      card.addEventListener("mouseenter", function () {
        const img = card.querySelector("img")
          ? card.querySelector("img").src
          : "";
        if (previewImg) previewImg.src = img;
        popup.style.display = "block";
      });

      card.addEventListener("mousemove", function (e) {
        popup.style.top = e.pageY + 20 + "px";
        popup.style.left = e.pageX + 20 + "px";
      });

      card.addEventListener("mouseleave", function () {
        popup.style.display = "none";
      });
    });
  }
});

/* ===== ระบบการจองทริปจากหน้าแรก ===== */
let currentHomeUnitPrice = 2500;
let currentHomePackageTitle = "";

function openHomeBookingModal(event, title, location, price) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  currentHomeUnitPrice = price;
  currentHomePackageTitle = `${title} (${location})`;

  const modal = document.getElementById("homeBookingModal");
  const form = document.getElementById("homeBookingForm");
  const success = document.getElementById("homeBookingSuccess");
  const titleEl = document.getElementById("homeBookingPackageTitle");
  const dateInput = document.getElementById("homeTravelDate");

  if (modal && form && success && titleEl) {
    titleEl.textContent = `จองทริป: ${currentHomePackageTitle}`;
    form.style.display = "block";
    success.style.display = "none";

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateInput) {
      dateInput.value = tomorrow.toISOString().split("T")[0];
    }

    updateHomeTotalPrice();
    modal.classList.add("active");
  }
}

function closeHomeBookingModal() {
  const modal = document.getElementById("homeBookingModal");
  if (modal) {
    modal.classList.remove("active");
  }
}

function updateHomeTotalPrice() {
  const countSelect = document.getElementById("homePersonCount");
  const priceDisplay = document.getElementById("homeTotalPriceDisplay");
  if (countSelect && priceDisplay) {
    const count = parseInt(countSelect.value) || 1;
    const total = currentHomeUnitPrice * count;
    priceDisplay.textContent = "฿" + total.toLocaleString();
  }
}

function submitHomeBooking(event) {
  event.preventDefault();

  const nameInput = document.getElementById("homeCustName");
  const dateInput = document.getElementById("homeTravelDate");
  const countSelect = document.getElementById("homePersonCount");
  const phoneInput = document.getElementById("homeCustPhone");

  const form = document.getElementById("homeBookingForm");
  const success = document.getElementById("homeBookingSuccess");

  if (nameInput && dateInput && countSelect && form && success) {
    const name = nameInput.value;
    const date = dateInput.value;
    const count = countSelect.value;
    const phone = phoneInput ? phoneInput.value : "";
    const total = currentHomeUnitPrice * parseInt(count);

    const bookingId = "#TRIP-" + Math.floor(100000 + Math.random() * 900000);

    document.getElementById("homeResBookingId").textContent = bookingId;
    document.getElementById("homeResPackageTitle").textContent =
      currentHomePackageTitle;
    document.getElementById("homeResCustName").textContent = name;
    document.getElementById("homeResTravelDate").textContent = date;
    document.getElementById("homeResPersonCount").textContent = count + " ท่าน";
    document.getElementById("homeResTotalPrice").textContent =
      "฿" + total.toLocaleString();

    // บันทึกประวัติการจองลง LocalStorage
    const newBooking = {
      id: bookingId,
      packageTitle: currentHomePackageTitle,
      custName: name,
      phone: phone,
      travelDate: date,
      personCount: count + " ท่าน",
      totalPrice: total,
      createdDate: new Date().toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    saveBookingToHistory(newBooking);

    form.style.display = "none";
    success.style.display = "block";
  }
}

/* ===== ระบบจัดการประวัติการจอง (Booking History) ===== */
function getBookingHistory() {
  try {
    const data = localStorage.getItem("travelBookings");
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveBookingToHistory(booking) {
  const history = getBookingHistory();
  history.unshift(booking);
  try {
    localStorage.setItem("travelBookings", JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save booking to localStorage", e);
  }
}

function deleteBookingItem(bookingId) {
  let history = getBookingHistory();
  history = history.filter((b) => b.id !== bookingId);
  try {
    localStorage.setItem("travelBookings", JSON.stringify(history));
  } catch (e) {}
  renderBookingHistory();
}

function clearAllBookingHistory() {
  if (confirm("คุณต้องการลบประวัติการจองทั้งหมดใช่หรือไม่?")) {
    try {
      localStorage.removeItem("travelBookings");
    } catch (e) {}
    renderBookingHistory();
  }
}

function openBookingHistoryModal() {
  renderBookingHistory();
  const modal = document.getElementById("bookingHistoryModal");
  if (modal) {
    modal.classList.add("active");
  }
}

function closeBookingHistoryModal() {
  const modal = document.getElementById("bookingHistoryModal");
  if (modal) {
    modal.classList.remove("active");
  }
}

function renderBookingHistory() {
  const container = document.getElementById("bookingHistoryList");
  if (!container) return;

  const history = getBookingHistory();
  if (history.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px 20px; color:#6b7280;">
        <div style="font-size:48px; margin-bottom:12px;">📋</div>
        <h4 style="margin:0 0 6px; color:#374151; font-size:16px;">ยังไม่มีประวัติการจอง</h4>
        <p style="margin:0; font-size:13px;">เมื่อคุณทำการจองทริป ข้อมูลการจองจะมาแสดงอยู่ที่นี่</p>
      </div>
    `;
    return;
  }

  let html = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; padding-bottom:10px; border-bottom:1px solid #e5e7eb;">
      <span style="font-size:13px; color:#6b7280; font-weight:600;">พบทั้งหมด ${history.length} รายการ</span>
      <button onclick="clearAllBookingHistory()" style="background:none; border:none; color:#ef4444; font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:4px;">🗑️ ลบประวัติทั้งหมด</button>
    </div>
    <div style="display:flex; flex-direction:column; gap:12px;">
  `;

  history.forEach((item) => {
    html += `
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:16px; position:relative; box-shadow:0 2px 6px rgba(0,0,0,0.02);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
          <div>
            <span style="display:inline-block; padding:3px 8px; background:#e0e7ff; color:#3730a3; border-radius:8px; font-size:12px; font-weight:bold;">${item.id}</span>
            <h4 style="margin:6px 0 2px; font-size:15px; color:#1e293b;">${item.packageTitle}</h4>
          </div>
          <button onclick="deleteBookingItem('${item.id}')" style="background:#fee2e2; border:none; color:#dc2626; width:26px; height:26px; border-radius:50%; font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s;" title="ลบรายการนี้">✕</button>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:13px; color:#475569; margin-top:8px;">
          <div>👤 <strong>ชื่อผู้เดินทาง:</strong> ${item.custName}</div>
          <div>📞 <strong>เบอร์โทร:</strong> ${item.phone || "-"}</div>
          <div>📅 <strong>วันเดินทาง:</strong> ${item.travelDate}</div>
          <div>👥 <strong>จำนวน:</strong> ${item.personCount}</div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; padding-top:10px; border-top:1px dashed #cbd5e1; font-size:12px;">
          <span style="color:#94a3b8;">🕒 จองเมื่อ: ${item.createdDate || "-"}</span>
          <span style="font-size:14px; font-weight:bold; color:#16a34a;">ยอดรวม: ฿${Number(item.totalPrice).toLocaleString()}</span>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}
