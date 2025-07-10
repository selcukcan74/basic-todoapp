const form = document.getElementById("gorevFormu");
const input = document.getElementById("gorevInput");
const liste = document.getElementById("gorevListesi");
const filtre = document.getElementById("filtre");
const errorMsg = document.getElementById("errorMsg");

let gorevler = JSON.parse(localStorage.getItem("gorevler")) || [];

// Hata mesajı göster
function hataGoster(mesaj) {
  errorMsg.textContent = mesaj;
  errorMsg.style.display = "block";
  setTimeout(() => {
    errorMsg.style.display = "none";
  }, 3000);
}

// Görev ekleme
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const metin = input.value.trim();

  if (metin === "") {
    hataGoster("Lütfen boş görev girmeyin.");
    return;
  }

  const zatenVar = gorevler.some(g => g.metin.toLowerCase() === metin.toLowerCase());
  if (zatenVar) {
    hataGoster("Bu görev zaten mevcut.");
    return;
  }

  const yeniGorev = {
    metin,
    tamamlandi: false,
    tarih: new Date().toLocaleString()
  };

  gorevler.push(yeniGorev);
  kaydet();
  input.value = "";
  listeyiYaz();
});

// Filtre değiştiğinde
filtre.addEventListener("change", listeyiYaz);

function kaydet() {
  localStorage.setItem("gorevler", JSON.stringify(gorevler));
}

function listeyiYaz() {
  liste.innerHTML = "";
  const filtreDegeri = filtre.value;

  gorevler.forEach((gorev, index) => {
    const goster =
      filtreDegeri === "hepsi" ||
      (filtreDegeri === "tamamlanan" && gorev.tamamlandi) ||
      (filtreDegeri === "tamamlanmayan" && !gorev.tamamlandi);

    if (!goster) return;

    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = gorev.tamamlandi;
    checkbox.addEventListener("change", () => {
      gorev.tamamlandi = checkbox.checked;
      kaydet();
      listeyiYaz();
    });

    const span = document.createElement("span");
    span.className = "gorevMetni";
    span.textContent = gorev.metin;
    if (gorev.tamamlandi) span.classList.add("tamamlandi");

    // Düzenleme için
    span.addEventListener("click", () => {
      const inputEdit = document.createElement("input");
      inputEdit.type = "text";
      inputEdit.className = "editInput";
      inputEdit.value = gorev.metin;
      li.replaceChild(inputEdit, span);
      inputEdit.focus();

      inputEdit.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const yeniMetin = inputEdit.value.trim();
          if (yeniMetin === "") {
            hataGoster("Görev boş olamaz.");
            listeyiYaz();
            return;
          }
          if (gorevler.some((g, i) => g.metin.toLowerCase() === yeniMetin.toLowerCase() && i !== index)) {
            hataGoster("Bu görev zaten var.");
            listeyiYaz();
            return;
          }
          gorev.metin = yeniMetin;
          kaydet();
          listeyiYaz();
        } else if (e.key === "Escape") {
          listeyiYaz();
        }
      });

      inputEdit.addEventListener("blur", () => listeyiYaz());
    });

    const tarih = document.createElement("div");
    tarih.className = "tarih";
    tarih.textContent = gorev.tarih;

    const silButonu = document.createElement("button");
    silButonu.innerHTML = `<i class="fas fa-trash"></i>`;
    silButonu.addEventListener("click", () => {
      // animasyon
      li.classList.add("fade-out");
      setTimeout(() => {
        gorevler.splice(index, 1);
        kaydet();
        listeyiYaz();
      }, 300);
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(silButonu);
    li.appendChild(tarih);

    liste.appendChild(li);
  });
}

// Sayfa yüklenince başlat
listeyiYaz();
