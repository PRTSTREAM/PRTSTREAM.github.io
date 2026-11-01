var dynamicEmbedLink = "";
var dynamicMobileLink = "";

var partA = "aHR0cHM6";
var partB = "Ly9pcGwyMDIw";
var partC = "LTQ2ZDJmLmZpcmViYXNlaW8uY29tL3dlYnNpdGUuanNvbg==";
var jsonApiUrl = atob(partA + partB + partC);

fetch(jsonApiUrl, { method: 'GET', mode: 'cors' })
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    if (data) {
      dynamicEmbedLink = data.embedlink || "";
      var imgLink = data.imglinkk || "";
      dynamicMobileLink = data.mobilelink || "";

      var bannerImg = document.getElementById("streamBanner");
      if (bannerImg && imgLink) {
        bannerImg.src = imgLink;
        bannerImg.style.display = "block";
      }

      if (isDesktop() && dynamicEmbedLink) {
        loadDesktopPlayer();
      }
    }
  })
  .catch(function(err) {
    console.error("Error loading stream data:", err);
  });

function isDesktop() {
  return !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}

function loadDesktopPlayer() {
  var container = document.getElementById("mediaContainer");
  if (dynamicEmbedLink) {
    container.innerHTML = '<iframe class="embed-player" src="' + dynamicEmbedLink + '" allowfullscreen="true" frameborder="0"></iframe>';
  }
}

function handlePlayClick() {
  if (isDesktop()) {
    loadDesktopPlayer();
  } else {
    playInMobileApp();
  }
}

function shareOnWhatsApp() {
  var message = "Is website par aap daily live matches dekh sakte hain: " + window.location.href;
  var whatsappUrl = "https://api.whatsapp.com/send?text=" + encodeURIComponent(message);
  window.open(whatsappUrl, '_blank');
}

var appCheckTimer = null;
var isAppOpened = false;

function playInMobileApp() {
  var streamUrl = dynamicMobileLink || "";
  var customSchemeUrl = "prtstream://play?url=" + encodeURIComponent(streamUrl);

  isAppOpened = false;

  var handleVisibilityChange = function() {
    if (document.hidden) {
      isAppOpened = true;
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.location.href = customSchemeUrl;

  if (appCheckTimer) clearTimeout(appCheckTimer);

  appCheckTimer = setTimeout(function() {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    if (!isAppOpened && !document.hidden) {
      showToast("Aapke paas PRT STREAM App install nahi he!");
      document.getElementById("installBtn").style.display = "flex";
    }
  }, 1800);
}

function showToast(message) {
  var toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.add("show");
  setTimeout(function() {
    toast.classList.remove("show");
  }, 4000);
}
