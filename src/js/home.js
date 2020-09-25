// /************************************ VARIABLES ************************************/ 
// console.log('hola mundo!');
// const noCambia = "Leonidas";

// let cambia = "@LeonidasEsteban"

// function cambiarNombre(nuevoNombre) {
//   cambia = nuevoNombre
// }


// /************************************ PROMESAS ************************************/ 
// const getUser = new Promise(
//   function(todoBien, todoMal){   //Recibira dos parametros (true, false)
//     //llamar a un api
//     setTimeout(     //Timers en js: setInterval, setTimeout
//       function(){
//         todoBien('Se acabo el tiempo 3S');
//       },3000)  //Recibe dos parametros Que hara | Tiempo en milisegundos
//   }
// ) //Un argumento que es una funcion

// const getUserAll = new Promise(
//   function(todoBien, todoMal){   //Recibira dos parametros (true, false)
//     //llamar a un api
//     setTimeout(     //Timers en js: setInterval, setTimeout
//       function(){
//         todoBien('Se acabo el tiempo 5S');
//       },5000)  //Recibe dos parametros Que hara | Tiempo en milisegundos
//   }
// ) //Un argumento que es una funcion

// getUser
// .then(function(){
//   console.log("Todo esta bien en la vida");
// }) //Todo salio bien
// .catch(
//   function(msg){
//     console.log(msg);
//   }
// )

// //Enviar muchas promesas
// Promise.all([
//   getUser,
//   getUserAll,
// ])
// .then(function(msg){    //Muestra los resultados por separado
//   console.log(msg)
// })
// .catch(function(msg){   //Cuando falla 1 de los N, no importa y termina la ejecucion
//   console.log(msg)
// })

// //Enviar muchas promesas pero solo ingresar al "then" de la promesa que termina primero
// Promise.race([    
//   getUser,
//   getUserAll,
// ])
// .then(function(msg){    //Muestra los resultados por separado
//   console.log(msg)
// })
// .catch(function(msg){   //Cuando falla 1 de los N, no importa y termina la ejecucion
//   console.log(msg)
// })


/************************************ AJAX en Jquery y JavaScript ************************************/ 
// $.ajax('https://randomuser.me/api/', {
//   method: 'GET',
//   success: function(data){
//     console.log(data);
//   },
//   error: function(error){
//     console.log(error)
//   }
// }) //Dos parametros Url|Configuracion


// fetch('https://randomuser.me/api/') //Dos paramtros url|config
// .then(function(response){
//   return response.json()
// })
// .then(function(user){
//   console.log('User ', user);
// })
// .catch(function(){
//   console.log('Algo fallo');
// })


/************************************ ASINCRONISMO ************************************/ 
(async function load(){

  const BASE_API = 'https://yts.mx/api/v2/';

  const $modal = document.getElementById('modal');
  const $overlay = document.getElementById('overlay');
  const $hideModal = document.getElementById('hide-modal');
  const $form = document.getElementById('form');
  const $home = document.getElementById('home');

  //Modal
  const $modalTitle = $modal.querySelector('h1');
  const $modalImage = $modal.querySelector('img');
  const $modalDescription = $modal.querySelector('p');  
  const $featureContainer = document.getElementById('featuring');


  function setAttributes($element, attributes){
    for(const attribute in attributes){
      $element.setAttribute(attribute, attributes[attribute]);      
    }
  }

  function featuringTemplate(peli){
    return (
      `<div class="featuring">
        <div class="featuring-image">
          <img src="${peli.medium_cover_image}" width="70" height="100" alt="">
        </div>
        <div class="featuring-content">
          <p class="featuring-title">Pelicula encontrada</p>
          <p class="featuring-album">${peli.title}</p>
        </div>
      </div>`
    )
  }

  $form.addEventListener('submit', async (event) => {
    event.preventDefault();
    $home.classList.add('search-active');
    const $loader = document.createElement('img');
    setAttributes($loader, {
        src: 'src/images/loader.gif',
        height: 50,
        width: 50
      })
      $featureContainer.append($loader);

      const data = new FormData($form);
      try{
        const {
          data: {
            movies: pelis
          }
        } = await getData(`${BASE_API}list_movies.json?limit=1&query_term=${data.get('name')}`);
        const HTMLString = featuringTemplate(pelis[0]);      
        $featureContainer.innerHTML = HTMLString;
      }catch(error){
        alert(error.message);
        $loader.remove();
        $home.classList.remove('search-active');
      }            
  })
    
  async function getData(url){
    const response = await fetch(url);
    const data = await response.json();
    if(data.data.movie_count > 0){
      return data;
    }
    throw new Error('No se encontro ningun resultado');
  }    
  
  function videoItemTemplate(movie, category){
    return (
      `<div class="primaryPlaylistItem" data-id="${movie.id}" data-category="${category}">
        <div class="primaryPlaylistItem-image">
          <img src="${movie.medium_cover_image}">
        </div>
        <h4 class="primaryPlaylistItem-title">
          ${movie.title}
        </h4>
       </div>`
    )
  }

  function createTemplate(HTMLString){
    let html = document.implementation.createHTMLDocument();   //Crear un elmento html
    html.body.innerHTML = HTMLString;
    return html.body.children[0];
  }

  function addEventClick($element){
    $element.addEventListener('click', function(){
      showModal($element);
    })
  }

  function renderMovieList(list, $container, category){
    $container.children[0].remove();

    list.forEach((movie) => {
      const HTMLString = videoItemTemplate(movie, category);  
      const movieElement = createTemplate(HTMLString);
      $container.append(movieElement);

      const img = movieElement.querySelector('img');
      img.addEventListener('load', (event) => {
        event.srcElement.classList.add('fadeIn');
      })      
      addEventClick(movieElement);
    });
  }  

  function findById(list, id){
    return list.find(movie => movie.id === parseInt(id, 10))
  }

  function findMovie(id, category){
    switch(category){
      case 'action': {
          return findById(actionList, id)
      }
      case 'drama': { 
        return findById(dramaList, id);
      }
      default:
        return findById(animationList, id);
    }    
  }

  function showModal($element){
    $overlay.classList.add('active');
    $modal.style.animation = 'modalIn .8s forwards';
    const id = $element.dataset.id;
    const category = $element.dataset.category;
    const data = findMovie(id, category);
    
    $modalTitle.textContent = data.title;
    $modalImage.setAttribute('src', data.medium_cover_image);
    $modalDescription.textContent = data.description_full;
  }

  function hideModal(){
    $overlay.classList.remove('active');
    $modal.style.animation = 'modalOut .8s forwards';
  }

  async function cacheExist(category){
    const listName = `${category}List`;    
    const cacheList = window.localStorage.getItem(listName);    

    if(cacheList != null){
      return JSON.parse(cacheList);
    }

    const {data: { movies: data }}  = await getData(`${BASE_API}list_movies.json?genre=${category}`);
    window.localStorage.setItem(listName, JSON.stringify(data));
    return data;
  }
  
  $hideModal.addEventListener('click', hideModal);
  
  // //Contenedores de listas de peliculas
  //const {data: { movies: actionList }} = await getData(`${BASE_API}list_movies.json?genre=action`)
  const actionList = await cacheExist('action');  
  const $actionContainer = document.querySelector('#action');  
  renderMovieList(actionList, $actionContainer, 'action');

  const dramaList = await cacheExist('drama');
  const $dramaContainer = document.getElementById('drama');  
  renderMovieList(dramaList, $dramaContainer, 'drama');

  const animationList = await cacheExist('animation');
  const $animationContainer = document.getElementById('animation');  
  renderMovieList(animationList, $animationContainer, 'animation');

})()  //Funcion auto ejecutada


