"use strict"


window.onload = init

let scene, camera, renderer, controls //глобальные переменные для создания сцены

function init(value_init, previous_input, number_of_symbols_resize) {

  /////задание основных переменных////////////////////////////////////////

  //база цветов//
  let basic_colors = ["#FFFFFF", "#E4388C", "#E4221B", "#FF7F00", "#FFED00", "#008739", "#02A7AA", "#47B3E7", "#2A4B9B", "#702283"]

  //базовый сборщик геометрии кубов//
  let cubeGeom = new THREE.CubeGeometry(1,1,1) 

  //материал кубов создаётся из массива цветов от нуля до девяти соответственно
  let color_material = basic_colors.map( color_n => new THREE.MeshBasicMaterial({ color: color_n }) )
  //еще один материал для бордера и дальнейших манипуляций с ним
  let color_material_for_border = new THREE.MeshBasicMaterial({ color: basic_colors[9] })

  //////////функция конструктора объектов//////////////////////////////////////////////////
  function cubus_construct(x, y, z, colornum) {//передаются координаты и номер цвета

      let color_material_choice = (colornum < 0) ? color_material_for_border //в конструкторе для бордюра задаются отрицательные значения цвета
                                                 : color_material[colornum]

      let cubus = new THREE.Mesh( cubeGeom, //геометрия куба задана один раз
                                  color_material_choice
                                )
      cubus.position.set(x,y,z) // устанавливается позиция объекта
      cubus.colornum = Math.abs(colornum) //идентификатор для отбора объектов по значению цвета
      scene.add(cubus) //визуализация полученного объекта

      return cubus
    }//возвращает новый объект куб, обработанный по заданным координатам и цвету

  /////////////////////////////////////////////////////////
  ////////////// прототипируемые функции /////////////////
  ///////////////////////////////////////////////////////

  if (!+value_init) { //эти функции инициализируются один раз при запуске

  ////функция для проверки различных значений selected_mandala (прототипирована в Number)
    Number.prototype.true_of = function(...props) {//передаётся множество цифровых значений // обычно (1,2,3)
        return props.indexOf(this) != -1 //проверяет, есть ли переменная, к которой применяется функция, в указанном множестве цифровых значений
      }//возвращает boolean

    ////функция подстановки нуля в строку для даты (прототипирована в Number)
    Number.prototype.zero_include = function() {//принимает число
        return this < 10 ? "0"+this : this.toString() //добавляет "0" при значениях меньше 10
      }//возвращает строку

    //удаляет все пробелы
    String.prototype.delete_all_spaces = function() { return this.replace(/[\s.,%]/g, '') }

    ///функция перевода строки в числа
    String.prototype.to_array_of_numbers = function(simbols_static_in_fn) {//принимает строку, где каждая позиция символа соответсвует числовому коду

      return this
              .split('') //перевод строки в массив
              .map( string_simbol =>   //пересборка в новый массив
                    +string_simbol || //если символ число, то возвращает число
                    simbols_static_in_fn.indexOf(string_simbol)%9+1 //иначе возвращает позицию символа в соответствии с таблицей Урсулы
                  )
    }//возвращает массив чисел

  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////

  //  if (!+value_init) - это проверка запущена ли функция init()
  //  в первый раз передаётся объект, который не является числом(NaN), соответственно - !false = true

  /////////////////////////////////////////////////////////////////////////////////////
  ///////////////////PRE_BEGIN////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////

  //добавил сцену
  if (!+value_init) scene = new THREE.Scene()
  scene.background = new THREE.Color( "white" ) //задал сцене задний фон

  //настроил параметры камеры
  if (!+value_init) camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 )
  camera.lookAt( 0, 0, 0 ) //смотреть в центр координат

  //выбрал рендер
  if (!+value_init) renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize( window.innerWidth-4, window.innerHeight-4 ) //отнял по 4 пикселя, потому что появляется прокрутка

  //добавление скрипта к документу в тег
  if (!+value_init) document.body.appendChild( renderer.domElement )
  //при динамическом изменении размера окна
  window.addEventListener('resize', onWindowResize, false)

  ///////////МАНИПУЛЯЦИЯ СЦЕНОЙ (оставил только приближение и удаление)//////////////////////
  // также активация внутри функции render() и onwindowresize() строкой controls.update()
  controls = new THREE.OrbitControls (camera, renderer.domElement)
  controls.minDistance = 2 //минимальная 
  controls.maxDistance = 444 //и максимальная дистанция при ручном приближении




  /////////////////////////////////////////////////////////////////////////////////
  //////////////////////////BEGIN/////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  //  задаёт разные мандалы
  // 4 - на квадрат (по три)                    +
  // 5 - на 6 пластин (цветок шахматный 1вар)   +
  // 6 - на 6 пластин (цветок по три)           +
  // 7 - на 6 пластин (цветок шахматный 2вар)   +
  // 8 - на квадрат шахматный расчёт (1вар)     +
  // 9 - на квадрат шахматый расчёт (2вар)      +
  // 
  let selected_mandala = +value_init || 4 //проверка на первый запуск init() (по умолчанию 4-ый вариант)

  let max_input_length = 33
  let max_expansion_length = 57

  ///////////////БЛОК ОБРАБОТКИ ВВОДИМОЙ СТРОКИ///////////////////////////////////////////////

  ///заменяемая строка при неверном вводе (сейчас вводит дату)
  let default_string = "01234567890" //тестовая строка на которую заменяется при неверном вводе
  ///Блок подстановки текущей даты
  let date_from_pc = new Date()
  //приводим дату к строке используя zero_include()
  default_string = date_from_pc.getDate().zero_include()
                 + (date_from_pc.getMonth()+1).zero_include()
                 + date_from_pc.getFullYear()

    
  //нормализация введенной строки для корректного перевода в цифровой массив
  // input_string = undefined;
  let input_string = +value_init ? previous_input : ""

  input_string = modification_to_normal(input_string, default_string)


  //////////////////////////////////////////////////////////////
  //здесь будет адаптация отдаления камеры по размеру вводимого значения
  if (selected_mandala.true_of(5,6,7)) camera.position.set( -95, 95, 95 ) //позиция камеры для трёхмерного цветка
  if (selected_mandala.true_of(4)) camera.position.set( 0, 0, 80 ) //позиция камеры для квадратов
  if (selected_mandala.true_of(8,9)) camera.position.set( 0, 0, 120 ) //позиция камеры для квадратов


  //////////////////////////////////////
  ///DOM///////////////////////////////
  ////////////////////////////////////

  ///statistic
  let statistic = document.querySelector("#statistic")

  let statistic_item = document.querySelectorAll("#statistic div")
  //обнуление значений статы
  for (let i = 1; i < statistic_item.length; i++) statistic_item[i].innerHTML = 0
  
  ///palitra
  //задаём массив кнопок
  let palitra = document.querySelectorAll(".palitra_button")
  //окрашиваем кнопки визуализации цветов
  palitra.forEach( (palitra,i) => palitra.style.background = basic_colors[i] )

  ///title_input
  let title_input = document.querySelector("#title_input")
  title_input.value = input_string; //вывод в заголовок обработанного текста
  
  ///number_of_symbols
  let number_of_symbols = document.querySelector("#number_of_symbols")
  number_of_symbols.placeholder = title_input.value.length
  number_of_symbols.max = max_expansion_length

  //selected_mandals_type
  let selected_mandala_type = document.querySelector("#select_mandala_type")

  ///numeric_adaptation
  let numeric_adaptation = document.querySelector("#numeric_adaptation")

  //ОК
  let ok_button = document.querySelector("#ok_button")

  ///события///
  //контроль ввода цифровых значений
  number_of_symbols.oninput = function() {
    number_of_symbols.value = number_of_symbols.value.delete_all_spaces()
    if (number_of_symbols.value == 0) number_of_symbols.value = ""
    if (number_of_symbols.value > max_expansion_length) number_of_symbols.value = max_expansion_length
  }

  //контроль ввода значений мандалы
  title_input.oninput = function() {
    //убираем пробелы,точки и запятые при вводе
    title_input.value = title_input.value.delete_all_spaces()
    //обрезаем ввод
    if (title_input.value.length >= max_input_length)
      title_input.value = title_input.value.substr(0,max_input_length)

    //данные о длине вводимой строки сразу вводятся в поле
    number_of_symbols.placeholder = title_input.value.length
  }

  //пересборка мандалы по нажанию Enter в полях ввода
  title_input.onkeydown = onEnter
  number_of_symbols.onkeydown = onEnter
  function onEnter(e) { if (e.key == "Enter") reinit() }
    //пересборка мандалы по нажанию кнопки "ОК"
  ok_button.onmousedown = function() { reinit() }


  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  //функция перезапуска мандалы с новыми данными//
  function reinit() {
      //удаление предыдущих объектов из памяти и со сцены
      remove_all_objects_from_memory(axis)
      remove_all_objects_from_memory(plain_x_cube)
      if (border) remove_all_objects_from_memory(border)

      input_string = modification_to_normal(title_input.value)

      init(select_mandala_type.value, input_string, +number_of_symbols.value || input_string.length )
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  


  //////////////////////////////////////////////////////////////
  /////// Блок адаптации букв в цифровой код //////////////////
  ////////////////////////////////////////////////////////////
  
  //символы расположены строго по таблице (удачно получилось то, что нужен всего один пробел)
  let simbols_static = "abcdefghijklmnopqrstuvwxyz абвгдеёжзийклмнопрстуфхцчшщъыьэюя"

  let string_for_algorithms = input_string.to_array_of_numbers(simbols_static)

  string_for_algorithms = string_for_algorithms_to_number_of_symbols(string_for_algorithms, number_of_symbols_resize)


  //добавляется нулевой элемент суммы всех чисел по фибоначи
  let summ_to_zero_element = to_one_fibbonachi_digit( string_for_algorithms.reduce( (sum,n) => sum+n ))
  
  string_for_algorithms.unshift( summ_to_zero_element )


  //отображение чисто цифрового значения с суммой
  let numeric_adaptation_text = string_for_algorithms.toString().delete_all_spaces() +
        " = " + string_for_algorithms[0]
  
  numeric_adaptation.innerHTML = numeric_adaptation_text.slice(1)



  ///////////ВЫБОР АЛГОРИТМА РАСЧЁТА///////////
  //высчитываем двумерный массив цветов для одной стороны мандалы
  let plane_of_colors = []

  if ( selected_mandala.true_of(4,6) )
    plane_of_colors = plane_square_3x_algorithm( string_for_algorithms )

  if ( selected_mandala.true_of(5,7,8,9) )
    plane_of_colors = chess_algorithm ( string_for_algorithms,
                                        selected_mandala.true_of(7,9) //передается boolean для второго расчёта оси
                                      )

  ///////////////////////////////////////////////////////////////////////////////
  //////////////// задание и визуализация объектов /////////////////////////////
  /////////////////////////////////////////////////////////////////////////////

  let axis = axis_visual( plane_of_colors[0] ) //задаём ось

  let plain_x_cube = plain_x_cube_visual(plane_of_colors) //пластины между осями

  //массив для элементов обводки мандалы
  let border = selected_mandala.true_of(4,8,9) ? //обводка только на квадратных мандалах
               border_visual(plane_of_colors[0]) : null
  

  ////анимация объектов////////////////////
  if (!+value_init) animate()

  //подсчёт статистики и его отображение
  statistic_value(axis)
  statistic_value(plain_x_cube)
  
  //отслеживание нажатия кнопок боковой панели и передача содержимого этих кнопок
  for (let i = 0; i < palitra.length; i++) {
    palitra[i].onmousedown = (event) => color_select_unvisibler(event.target.innerHTML) //передача в функцию визуального содержимого кнопки
  }

  //затемнение неактивных кнопок на основе статы
  for (let i = 1; i < 10; i++) {
    palitra[i].style.opacity = statistic_item[i].innerHTML == 0 ? 0.5 : 1
  }


  //\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//
  //\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//
  //\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//

  //КОНЕЦ ОСНОВНОГО БЛОКА, ДАЛЬШЕ ТОЛЬКО ФУНКЦИИ//

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  ///МАНИПУЛЯЦИИ С ПРИМЕНЕНИЕМ И ОСЛЕЖИВАНИЕМ СОБЫТИЙ НАЖАТИЯ НА ОБЪЕКТЫ И КНОПКИ НА БОКОВОЙ ПАНЕЛИ///
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  ////функция исчезания|появления кубов
  function color_select_unvisibler(color_in_fn) { //передаётся символ внутри кнопки

    //функция перебора массива с отслеживанием нажатых кнопок
    function foreach_visibler(arr) { //в ф-цию передаем массив
      arr.forEach(function(item) { //перебираем массив
          if (color_in_fn === "#") item.visible = false //все искомые элементы становятся невидимыми
          if (color_in_fn === "@" ||
             +color_in_fn === +item.colornum ) item.visible = !item.visible //смена видимости на невидимость
          if (color_in_fn === "A") item.visible = true //все искомые элементы становятся видимыми
        })
    }

    //перебор по осям
    foreach_visibler(axis)
    //перебор по плоскостям
    foreach_visibler(plain_x_cube)

    //дополнительно статистика на "S"
    if (color_in_fn === "S") {
      statistic.style.filter = statistic.style.filter == "blur(0px)" ? "blur(10px)" : "blur(0px)"
      statistic.style.fontSize = statistic.style.fontSize == "100%" ? "0.001px" : "100%"
    }


    //только для бордера//
    if (color_in_fn === "B") border.forEach( function(entry) { 
      entry.colornum = (+entry.colornum === 9 ) ? 0 : ++entry.colornum //перебор цвета в замкнутом цикле 9 и смена значения
      entry.material.color.set(basic_colors[entry.colornum]) //присвоение значения цвета
      })

    //отдаление/приближение//
    if (color_in_fn === "+") camera.position.z = camera.position.z - 10
    if (color_in_fn === "-") camera.position.z = camera.position.z + 10
    }


  ///////////////////////////////////////////////////////////////////////////////
  ///////ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ АНАЛИЗА И ПРЕОБРАЗОВАНИЯ///////////////////////
  /////////////////////////////////////////////////////////////////////////////

  ////универсальная функция числа фибоначчи/////////////////
  function to_one_fibbonachi_digit(number_in_fn) {//передаётся числовое значение

      let amount = 
          Math.abs(+number_in_fn) //на всякий случай перевод из отрицательного в абсолютное значение с нумеризацией
          .toString()           //перевод числа в строку для разъединения многозначных чисел
          .split('')           //перевод строки в массив
          .map(Number)        //перевод массива символов в массив чисел
          .reduce( (sum,n) => sum+n ) //перебор массива с подсчётом суммы чисел

      return amount > 9 ? to_one_fibbonachi_digit(amount) : amount //замыкание функции при многозначной сумме
  }//возвращает одну цифру суммы всех сумм по фибоначчи


  ////функция нормализации введенной строки, и замены его на тестовое значение
  function modification_to_normal(string_from_user_input, string_by_default) {//принимает две строки, string_from_user_input - на обработку, string_by_default - на замену, если string_from_user_input оказалась false

    return  (
              !string_from_user_input ||
              !string_from_user_input.trim() ||
              +string_from_user_input == 0
            ) ? //проверка string_from_user_input на значения приводящие к false (в том числе пустая строка после сброса пробелов)
                modification_to_normal(string_by_default,"0123456789") //если ввод пустой то присваивается значение по умолчанию //и (на всякий случай) обрабатывается и оно
              : 
                string_from_user_input
                  .delete_all_spaces() //убираем все пробелы
                  .slice(0,max_input_length)        //обрезание более 30ти символов
                  .toLowerCase()     //убираем верхний регистр
  }//возвращает обработанную строку без пробелов меньше тридцати символов в нижнем регистре, либо обработанную тестовую строку


  ////функция пересборки цифрового кода строки до нужного количества цифр
  function string_for_algorithms_to_number_of_symbols(input_array_fn, number_of_symbols_fn) {

    //сужение по Урсуле
    function minus(minarray, mlength) {//массив и количество нужных чисел
      let minus_one = []
      for (let i=0; i < minarray.length-1; i++)
        minus_one.push(to_one_fibbonachi_digit(minarray[i]+minarray[i+1]))

      return (minus_one.length == mlength) ? minus_one : minus(minus_one, mlength)
    }//возвращает сужаемый до нужного количества цифр массив

    //расширение по Урсуле
    // function plus(pstring, plength) {
    //   let plus_one = pstring
    //   plus_one.push(to_one_fibbonachi_digit( pstring[pstring.length-1] + pstring[pstring.length-2] ))

    // return (plus_one.length == plength) ? plus_one : plus(pstring, plength)
    // }

    //расширение по Юле
    function another_plus(another_plus_array, alength) {
      let another_one = []
      another_one.push(another_plus_array[0])

      for (let i=0; i < another_plus_array.length-1; i++)
        another_one.push( to_one_fibbonachi_digit(another_plus_array[i]+another_plus_array[i+1]),
                          another_plus_array[i+1]
                        )
      return (another_one.length >= alength) ? another_one : another_plus(another_one, alength)
    }// массив расширяется на порядок (lenght*2-1)
    
    //на уменьшение
    if (number_of_symbols_fn < input_array_fn.length )
        input_array_fn = minus(input_array_fn, number_of_symbols_fn)

    //на расширение
    if (number_of_symbols_fn > input_array_fn.length) {
        //классическое расширение
        // input_array_fn = plus(input_array_fn, number_of_symbols_fn)

        // массив расширяется на порядок (lenght*2-1)
        input_array_fn = another_plus(input_array_fn, number_of_symbols_fn)
        
        // сокращаем до нужной длины по стандартному алгоритму
        if (input_array_fn.length != number_of_symbols_fn)
          input_array_fn = minus(input_array_fn, number_of_symbols_fn)
        }

    return input_array_fn
  }

  ///подсчёт статистики
  function statistic_value(objects_to_count) {
    for (let i = 0; i < objects_to_count.length; i++)
      if (objects_to_count[i].colornum !=0) //ноль не считаем
        statistic_item[objects_to_count[i].colornum].innerHTML =
          ++statistic_item[objects_to_count[i].colornum].innerHTML
  }//манипуляция с DOM объектами statistic_item

  ///////////////////////////////////////////////////////////////////////////////
  /////////////////////АЛГОРИТМЫ ПОДСЧЁТА МАНДАЛ////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////

  ////////пластина мандалы из кубов по первому алгоритму (Юлин вариант)///////
  function plane_square_3x_algorithm(input_nums_in_fn) {//принимает одномерный массив чисел, созданных из введенной строки
    //задаём основной цифро-световой массив мандалы
    let matrix = []
    //сначала назначаем ось по горизонтали
      matrix[0] = input_nums_in_fn
    //и зеркально по вертикали от единицы
    for (let i=1; i <= input_nums_in_fn.length; i++) {
      //первое значение каждой строки
      matrix[i] = [matrix[0][i]]
    }

    //высчитываем мандалу на основе заданных осей (массивы считаются от 1, потому что подсчёт -1)
    let fibbo_number
    for (let y=1; y < input_nums_in_fn.length; y++)
      for (let x=1; x < input_nums_in_fn.length; x++) {

        fibbo_number = to_one_fibbonachi_digit( matrix[y-1][x] +
                                                matrix[y][x-1] +
                                                matrix[y-1][x-1]
                                              )

        matrix[y].push(fibbo_number)
      }

    return matrix
  }//возвращает двумерный массив

  ////////алгоритм сбора мандалы по шахматной схеме/////////////////////////////
  function chess_algorithm(input_nums_fn, mirror_variant = false ) {//принимает одномерный массив чисел, созданных из введенной строки и модификатор стиля отображения косой оси

    let axis_fn = !mirror_variant ?
    //первый вариант если false
      [ //создаём базис отсчёта сумма посередине и по краям, основное "слово" от центра
        input_nums_fn[0], //это уже посчитанная заранее сумма вписанная в нулевой элемент
        ...input_nums_fn.map((n,i,arr) => arr[arr.length-1-i]), //разворот вводного значения, соотвественно сумма из нулевого значения становится в середине
        ...input_nums_fn.slice(1), //еще раз вставляем значение и обрезаем повторную сумму
        input_nums_fn[0] //и снова сумма в конце
      ]
      :
    //второй вариант если true
      [//создаём базис отсчёта сумма посередине и по краям, основное "слово" от краёв к центру
        ...input_nums_fn,
        input_nums_fn[0],
        ...input_nums_fn.map((n,i,arr) => arr[arr.length-1-i]) //аналог reverse() без изменения массива
      ]

    let matrix = axis_fn.map(n => axis_fn.map( n => 0)) // создаём двумерную матрицу на нулях на основе размера базиса

    axis_fn.forEach( (n,i) => matrix[i][i] = n) // вписываем косую "ось" (базис) в матрицу подсчёта

      //сначала расчёт диагонали в сторону уменьшения
      for (let i=1; i < axis_fn.length; i++)
        for (let j=i; j < axis_fn.length; j++)

            matrix[j][j-i] =
              to_one_fibbonachi_digit ( //складывается в шахматном порядке нечетная диагональ по две цифры
                                        matrix[j][j-i+1]
                                        + matrix[j-1][j-i]
                                        + ((i%2==0) ? matrix[j-1][j-i+1] : 0) //четные диагонали - по три цифры
                                      )

      //расчёт диагонали в сторону увеличения
       for (let i=0; i < axis_fn.length; i++)
        for (let j=0; j < axis_fn.length-1-i; j++)

            matrix[j][j+i+1] = 
              to_one_fibbonachi_digit ( //складывается в шахматном порядке нечетная диагональ по две цифры
                                        matrix[j][j+i]
                                        + matrix[j+1][j+i+1]
                                        + ((i%2==0) ? matrix[j+1][j+i] : 0) //четные диагонали - по три цифры
                                      )

    return matrix.reverse()
  }//возвращаем развёрнутую наоборот двумерную матрицу, потому как отображение с другого угла

  ///////////////////////////////////////////////////////////////////////////////
  /////// ФУНКЦИИ ВИЗУАЛЬНОЙ СБОРКИ и ГРУППИРОВКИ ОБЪЕКТОВ В МАССИВ ////////////
  /////////////////////////////////////////////////////////////////////////////
  

  //////////сборка осей //////////
  function axis_visual(input_nums_fn) {//принимает одномерный числовой массив
    let axis_fn = []
    //нулевой куб в центре оси

    axis_fn[0] = cubus_construct( 0,0,0, input_nums_fn[0] )

    let color_n
    for (let i = 1; i < input_nums_fn.length; i++) {
      color_n = input_nums_fn[i]

      if ( selected_mandala.true_of(4,5,6,7,8,9) ) axis_fn.push( cubus_construct( i,0,0, color_n) )
      if ( selected_mandala.true_of(4,5,6,7,8,9) ) axis_fn.push( cubus_construct( 0,i,0, color_n) )

      if ( selected_mandala.true_of(4,5,6,7,8,9) ) axis_fn.push( cubus_construct( -i,0,0, color_n) )
      if ( selected_mandala.true_of(4,5,6,7,8,9) ) axis_fn.push( cubus_construct( 0,-i,0, color_n) )

      if ( selected_mandala.true_of(5,6,7) ) axis_fn.push( cubus_construct( 0,0,i, color_n) )
      if ( selected_mandala.true_of(5,6,7) ) axis_fn.push( cubus_construct( 0,0,-i, color_n) )
    }

    return axis_fn
  }//возвращает одномерный массив объектов


  ///////рабочий вариант обводки мандалы////////////////////////
  function border_visual(input_nums_fn) {//принимает одномерный числовой массив
    //перменные для обводки мандалы
    let border_coordin = input_nums_fn.length
    let color_n = summ_to_zero_element
    let border_fn = [] //массив для элементов обводки мандалы
  
    color_material_for_border.color.set(basic_colors[color_n]) //присваивается цвет нулевой клетки
  
      for (let i = -border_coordin; i < border_coordin; i++) {
          border_fn.push(
            cubus_construct( -border_coordin, i, 0, -color_n ), //левая
            cubus_construct( i, border_coordin, 0, -color_n ), //верхняя
            cubus_construct( border_coordin, -i, 0, -color_n ), //правая
            cubus_construct( -i, -border_coordin, 0, -color_n ) //нижняя
          )

      }

    return border_fn
  }//возвращает одномерный массив объектов


  ////////пластина/плоскость кубов/////////////
  function plain_x_cube_visual(plane_of_colors_fn) {//принимает одномерный числовой массив

    let plain_x_cube_fn = []
    //отрисовка панелей
    let color_n
    for (let y = 1; y < plane_of_colors_fn[0].length; y++)
      for (let x = 1; x < plane_of_colors_fn[0].length; x++) {

        //назначение цвета в соответствии с цветоцифрами, вычисленными по примененному алгоритму
        color_n = plane_of_colors_fn[y][x] 

        if (selected_mandala.true_of(4,5,6,7,8,9))
          plain_x_cube_fn.push( cubus_construct ( y, x, 0, color_n) )

        if (selected_mandala.true_of(4,5,6,7,8,9))
          plain_x_cube_fn.push( cubus_construct ( -y, -x, 0, color_n) )

        if (selected_mandala.true_of(4,8,9))
          plain_x_cube_fn.push( cubus_construct ( -x, y, 0, color_n) )

        if (selected_mandala.true_of(4,8,9))
          plain_x_cube_fn.push( cubus_construct ( x, -y, 0, color_n) )

        if (selected_mandala.true_of(5,6,7))
          plain_x_cube_fn.push( cubus_construct ( y, 0, x, color_n) )

        if (selected_mandala.true_of(5,6,7))
          plain_x_cube_fn.push( cubus_construct ( 0, -y, x, color_n) )

        if (selected_mandala.true_of(5,6,7))
          plain_x_cube_fn.push( cubus_construct ( -y, 0, -x, color_n) )

        if (selected_mandala.true_of(5,6,7))
          plain_x_cube_fn.push( cubus_construct ( 0, y, -x, color_n) )
      }

    return plain_x_cube_fn
  }//возвращает одномерный массив объектов


  ///////////////////////////////////////////////////////////////////////////////
  /////////////////////СПЕЦИАЛЬНЫЕ ФУНКЦИИ THREEX///////////////////////////////
  /////////////////////////////////////////////////////////////////////////////


  /////функция изменения центровки камеры при изменении размера экрана///////////////
  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth-4, window.innerHeight-4)

    controls.update() //для сохранения пропорций при динамическом изменении ширины экрана

  }


  ////анимация
  function animate() {

    requestAnimationFrame( animate )

    // рендеринг
    controls.update() //манипуляция со сценой
    renderer.render( scene, camera )
    // console.log(camera.position)
  }


  ////функция очистки памяти от ссылок на объекты THREEX, оставшихся в render
  function remove_all_objects_from_memory(object_to_clear) {

    //функция поиска соответствий на наличие объектов
    function disposeNode(parentObject) {

    parentObject.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
            if (node.geometry) {
                node.geometry.dispose();
            }

            if (node.material) {

                if (node.material instanceof THREE.MeshFaceMaterial || node.material instanceof THREE.MultiMaterial) {
                    node.material.materials.forEach(function (mtrl, idx) {
                        if (mtrl.map) mtrl.map.dispose();
                        if (mtrl.lightMap) mtrl.lightMap.dispose();
                        if (mtrl.bumpMap) mtrl.bumpMap.dispose();
                        if (mtrl.normalMap) mtrl.normalMap.dispose();
                        if (mtrl.specularMap) mtrl.specularMap.dispose();
                        if (mtrl.envMap) mtrl.envMap.dispose();

                        mtrl.dispose();    // disposes any programs associated with the material
                    });
                }
                else {
                    if (node.material.map) node.material.map.dispose();
                    if (node.material.lightMap) node.material.lightMap.dispose();
                    if (node.material.bumpMap) node.material.bumpMap.dispose();
                    if (node.material.normalMap) node.material.normalMap.dispose();
                    if (node.material.specularMap) node.material.specularMap.dispose();
                    if (node.material.envMap) node.material.envMap.dispose();

                    node.material.dispose();   // disposes any programs associated with the material
                }
            }
        }
      });
    }

    //сама реализация очистки
    for (let i = 0; i < object_to_clear.length; i++) {

      scene.remove( object_to_clear[i] ) //убираем объект со сцены
      disposeNode(object_to_clear[i]) //запускаем встроенную функцию очистки
      object_to_clear[i] = null //зачищаем сам массив
    
    }

    //дополнительная очистка (на всякий)
    object_to_clear.length = 0

  }

///////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////
} //init() end bracket