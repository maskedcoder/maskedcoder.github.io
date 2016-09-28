(function main() {
  var $copyright = document.querySelector('.js-copyright');
  var year = (new Date()).getFullYear();

  $copyright.innerHTML = year;
})();
