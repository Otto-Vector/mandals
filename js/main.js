
window.onload = init

var scene, camera, renderer, domEvents, controls
var mmm = new Array()


function init() {

  //////////Задал основные константы///////
  //база цветов//
  let colors = ["white", "deeppink", "red", "gold", "yellow", "lime", "mediumspringgreen", "lightseagreen", "blue", "purple"]

  let input_string = prompt("Введите цифры", '')
  // let input_string = "0123456789"
  let input_nums = [];
  for (let i=0; i<input_string.length; i++)
    input_nums[i] = parseInt(input_string[i])


  ///////////////////////////////////////////////////////////////////////////  
  //добавил сцену
  scene = new THREE.Scene();
  scene.background = new THREE.Color( "whitesmoke" ) //задал сцене задний фон

  //настроил параметры камеры
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 100 )
  camera.position.set( -45, 45, 45 ) //позиция камеры
  camera.lookAt( 0, 0, 0 ) //смотреть в центр координат

  //выбрал рендер
  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize( window.innerWidth-4, window.innerHeight-4 ) //отнял по 4 пикселя, потому что появляется прокрутка

  //добавление скрипта к документу в тег
  document.body.appendChild( renderer.domElement )
  //при динамическом изменении размера окна
  window.addEventListener('resize', onWindowResize, false)

  ///////////МАНИПУЛЯЦИЯ СЦЕНОЙ
  // также активация внутри функции render() и onwindowresize() строкой controls.update()
  controls = new THREE.OrbitControls (camera, renderer.domElement);
  controls.minDistance = 1
  controls.maxDistance = 80


  ////////////////////////////////////////////////////////

  // функция числа фибоначчи
  let to_one_digit = (digit) => {

    let string_of_digits = digit.toString()
    digit = 0

    for (let i=0; i < string_of_digits.length; i++)
      digit += parseInt(string_of_digits[i])

    return (digit > 9) ? to_one_digit(digit) : digit

  }

  //функция конструктора объектов
  let axis_construct = plane_construct = (axis, material, x, y, z) => {
    axis = new THREE.Mesh(cubeGeom,material);
    axis.position.set(x,y,z)
    scene.add(axis)
  }

  ///////////////////////////////////////////////////////////////////////////////
  //добавляем куб
  let cubeGeom = new THREE.CubeGeometry(1,1,1);

  //нулевой куб в центре оси
  let cubeMaterial_zero = new THREE.MeshBasicMaterial({color: colors[input_nums[0]] })
  let cube_zero = new THREE.Mesh(cubeGeom,cubeMaterial_zero)
  cube_zero.position.set(0,0,0)
  scene.add(cube_zero)

  //сборка осей по 6 направлениям
  let axis = {  "x" : [],
                "y" : [],
                "z" : [],
                "mx": [],
                "my": [],
                "mz": []
              }


  for (let i=1; i < input_string.length; i++) {
    let cubeMaterial = new THREE.MeshBasicMaterial({color: colors[input_nums[i]] })

    axis_construct(axis.x[i], cubeMaterial, 0+i,0,0)
    axis_construct(axis.y[i], cubeMaterial, 0,0+i,0)
    axis_construct(axis.z[i], cubeMaterial, 0,0,0+i)

    axis_construct(axis.mx[i], cubeMaterial, 0-i,0,0)
    axis_construct(axis.my[i], cubeMaterial, 0,0-i,0)
    axis_construct(axis.mz[i], cubeMaterial, 0,0,0-i)

  }


////////пластина мандалы из кубов//////////////////////////////////////////////////
  //задаём основной цифро-световой массив мандалы
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

  ////////пластина кубов/////////////
  //задание объекта
  let plain_x_cube = []
  //углубление массива
  for (var y = 1; y < input_string.length; y++) {
    plain_x_cube[y] = []
  }
  //отрисовка
  for (let y = 1; y < input_string.length; y++) {
    for (let x = 1; x < input_string.length; x++) {
      let cubeMaterial = new THREE.MeshBasicMaterial({color: colors[plane_of_colors[y][x]]});

      plane_construct(plain_x_cube[y][x], cubeMaterial, y, x, 0)
      plane_construct(plain_x_cube[y][x], cubeMaterial, y, 0, x)
      plane_construct(plain_x_cube[y][x], cubeMaterial, 0, -y, x)

      plane_construct(plain_x_cube[y][x], cubeMaterial, -y, -x, 0)
      plane_construct(plain_x_cube[y][x], cubeMaterial, -y, 0, -x)
      plane_construct(plain_x_cube[y][x], cubeMaterial, 0, y, -x)

    }
  }


  ////анимация объектов////////////////////
  animate()

  function animate() {

    requestAnimationFrame( animate )
    render()

  }

  function render() {


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

  console.log(camera.position)

  controls.update() //для сохранения пропорций при динамическом изменении ширины экрана

}
