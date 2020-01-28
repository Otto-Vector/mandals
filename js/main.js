
window.onload = init

var scene, camera, renderer, domEvents, controls
var mmm = new Array()


function init() {

  //////////Задал основные константы///////
  //база цветов//
  let colors = ["white", "deeppink", "red", "gold", "yellow", "lime", "mediumspringgreen", "lightseagreen", "blue", "purple"]

  // let input_string = prompt("Введите цифры", '')
  let input_string = "123456789"
  let input_nums = [];
  for (let i=0; i<input_string.length; i++)
    input_nums[i] = parseInt(input_string[i])

  // функция числа фибоначчи
  let to_one_digit = (digit) => {

    let string_of_digits = digit.toString()
    digit = 0

    for (let i=0; i < string_of_digits.length; i++)
      digit += parseInt(string_of_digits[i])

    return (digit > 9) ? to_one_digit(digit) : digit

  }

  //задаём основной цифровой массив мандалы 
  var plane_of_colors = []
  //сначала назначаем ось
    plane_of_colors[0] = input_nums
  for (let i=1; i < input_string.length; i++) {
    plane_of_colors[i] = [plane_of_colors[0][i]]
  }

  //высчитываем мандалу 
  for (let y=1; y < input_string.length; y++)
    for (var x = 1; x < input_string.length; x++) {
      let fibbo_number = to_one_digit( plane_of_colors[y-1][x] +
                                       plane_of_colors[y][x-1] +
                                       plane_of_colors[y-1][x-1])
      plane_of_colors[y].push(fibbo_number)
    }

  // console.log(plane_of_colors);
  ///////////////////////////////////////////////////////////////////////////  
  //добавил сцену
  scene = new THREE.Scene();
  scene.background = new THREE.Color( "whitesmoke" ) //задал сцене задний фон

  //настроил параметры камеры
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 80 )
  camera.position.set( 0, 0, 150 ) //позиция камеры
  camera.lookAt( 0, 0, 0 ) //смотреть в центр координат

  //выбрал рендер
  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize( window.innerWidth-4, window.innerHeight-4 ) //отнял по 4 пикселя, потому что появляется прокрутка

  //добавление скрипта к документу в тег
  document.body.appendChild( renderer.domElement )

  window.addEventListener('resize', onWindowResize, false)

  ///////////МАНИПУЛЯЦИЯ СЦЕНОЙ
  // также активация внутри функции render() и onwindowresize() строкой controls.update()
  controls = new THREE.OrbitControls (camera, renderer.domElement);
  controls.minDistance = 1
  controls.maxDistance = 80

  ///////////////////////////////////////////////////////////////////////////////
  //добавляем куб
  var x_cube = []
  let cubeGeom = new THREE.CubeGeometry(1,1,1);

  for (let i=0; i < input_string.length; i++) {
    let cubeMaterial = new THREE.MeshBasicMaterial({color: colors[input_nums[i]] });
    x_cube[i] = new THREE.Mesh(cubeGeom,cubeMaterial);
    x_cube[i].position.set(0+i,0,0)
    //добавление объекта на сцену
    scene.add(x_cube[i])
  }

  let y_cube = []
  for (let i=1; i < input_string.length; i++) {
    let cubeMaterial = new THREE.MeshBasicMaterial({color: x_cube[i].material.color});
    y_cube[i] = new THREE.Mesh(cubeGeom,cubeMaterial);
    y_cube[i].position.set(0,0+i,0)
    scene.add(y_cube[i])
  }

   let z_cube = []
  for (let i=1; i < input_string.length; i++) {
    let cubeMaterial = new THREE.MeshBasicMaterial({color: x_cube[i].material.color});
    z_cube[i] = new THREE.Mesh(cubeGeom,cubeMaterial);
    z_cube[i].position.set(0,0,0+i)
    scene.add(z_cube[i])
  }

  let mx_cube = []
  for (let i=1; i < input_string.length; i++) {
    let cubeMaterial = new THREE.MeshBasicMaterial({color: x_cube[i].material.color});
    mx_cube[i] = new THREE.Mesh(cubeGeom,cubeMaterial);
    mx_cube[i].position.set(0-i,0,0)
    scene.add(mx_cube[i])
  }

  let my_cube = []
  for (let i=1; i < input_string.length; i++) {
    let cubeMaterial = new THREE.MeshBasicMaterial({color: x_cube[i].material.color});
    my_cube[i] = new THREE.Mesh(cubeGeom,cubeMaterial);
    my_cube[i].position.set(0,0-i,0)
    scene.add(my_cube[i])
  }

  let mz_cube = []
  for (let i=1; i < input_string.length; i++) {
    let cubeMaterial = new THREE.MeshBasicMaterial({color: x_cube[i].material.color});
    mz_cube[i] = new THREE.Mesh(cubeGeom,cubeMaterial);
    mz_cube[i].position.set(0,0,0-i)
    scene.add(mz_cube[i])
  }




////////пластина мандалы из кубов//////////////////////////////////////////////////
  let plain_cube = []
  for (var y = 1; y < input_string.length; y++) {
    plain_cube[y] = []
  }
  for (let y = 1; y < input_string.length; y++) {
    for (let x = 1; x < input_string.length; x++) {
      let cubeMaterial = new THREE.MeshBasicMaterial({color: colors[plane_of_colors[y][x]]});

      plain_cube[y][x] = new THREE.Mesh(cubeGeom,cubeMaterial);
      plain_cube[y][x].position.set(y,x,0)

      scene.add(plain_cube[y][x])
    }
  }






  ////анимация объектов////////////////////
  animate()

  function animate() {

    requestAnimationFrame( animate )
    render()

  }

  function render() {

    // //задание значений для поворота объекта
    // function rotation( name_of_object, x, y, speed ) {
    
    //   name_of_object.rotation.x += x/1000*speed
    //   name_of_object.rotation.y += y/1000*speed

    // }

    //   rotation( cube, 1, 2, 10 )

    controls.update() //манипуляция со сценой

    renderer.render( scene, camera )

    }


  ///////// применил отслеживание по клику с помощью библиотеки threex.domevents.js ////////
  // var domEvents = new THREEx.DomEvents(camera, renderer.domElement)

  // //назначил перебором отслеживание событий на каждую сферу
  // for (let n = 0; n < cubes_maximum; n++) //перебор по количеству собранных кубов
  //   for (let sphere_num = 0; sphere_num < spheres[n].length; sphere_num++)
  //     domEvents.addEventListener( spheres[n][sphere_num], 'mousedown', (event)=> {spheres_color_to_edges(event)})


  // //функция перекраски рёбер в найденой в domEvents
  // var spheres_color_to_edges = (event) => {

  //   for (let n = 0; n < cubes_maximum; n++) { //перебор по количеству собранных кубов

  //     //проверяет на какую из сфер было нажато и передаёт значение индекса в found_at[]
  //     let found_at = [];
  //     for (let i = 0; i < spheres[n].length; i++ )
  //       found_at[n] = ( event.target.uuid == spheres[n][i].uuid ) ? i : found_at[n];

  //       //перекраска рёбер, исходящих из нажатой сферы в её цвет
  //       if ( found_at[n] !== undefined ){ //убираем ненужные проверки при неназначенных found_at[]
  //         for (let i = 0; i < communication_array.length; i++) //сверяется по массиву communication_array

  //           //если одна из сторон вектора принадлежит номерной области сферы, то...
  //           if ( communication_array[i][0] == found_at[n] || communication_array[i][1] == found_at[n] )
  //             //...перекрашиваем в цвет найденной сферы
  //             edge[n][i].material.color.set(spheres[n][found_at[n]].material.color)

  //         n = cubes_maximum //завершаем родительский цикл, так как "дело сделано"
  //       }
  //     }

  //   }


} //init() end bracket

/////функция изменения центровки камеры при изменении размера экрана///////////////
function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth-4, window.innerHeight-4)

  controls.update() //для сохранения пропорций при динамическом изменении ширины экрана

}
