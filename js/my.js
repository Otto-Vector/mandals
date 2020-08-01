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
  controls.maxDistance = 444 //максимальная дистанция при ручном приближении




  /////////////////////////////////////////////////////////////////////////////////
  //////////////////////////BEGIN/////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  //  задаёт разные мандалы
  // 3 - "ромб" (концентрация квадрата по три)  +
  // 4 - на квадрат (по три)                    +
  // 8 - на квадрат шахматный расчёт (1вар)     +
  // 9 - на квадрат шахматый расчёт (2вар)      +
  // 
  let selected_mandala = +value_init || 4 //проверка на первый запуск init() (по умолчанию 4-ый вариант)

  //максимальное количество символов вводимой строки
  let max_input_length = 33
  //максимальное количество знаков на расширение
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

    
  
  //пустая строка при первой инициализации
  let input_string = +value_init ? previous_input : ""

  //нормализация введенной строки для корректного перевода в цифровой массив
  input_string = modification_to_normal(input_string, default_string)


  //////////////////////////////////////////////////////////////
  //здесь будет адаптация отдаления камеры по размеру вводимого значения
  if (selected_mandala.true_of(4,3)) camera.position.set( 0, 0, 60 ) //позиция камеры для малых квадратов
  if (selected_mandala.true_of(8,9)) camera.position.set( 0, 0, 120 ) //позиция камеры для больших квадратов


  //////////////////////////////////////
  ///DOM///////////////////////////////
  ////////////////////////////////////

  ///statistic_item
  //объекты пунктов статы
  let statistic_item = document.querySelectorAll("#statistic div")
  
  //обнуление значений статы
  statistic_item__zero()

  ///statistic_button
  //кнопка вывода статы
  let statistic_button = document.querySelector("#statistic_button")

  ///palitra
  //задаём массив кнопок
  let palitra = document.querySelectorAll(".palitra_button")
  
  //возвращение кнопок в дефолтное значение
  palitra_button__default_pos_value()
  //окрашиваем кнопки визуализации цветов
  palitra_button__colored()
  
  ///title_input
  //поле ввода значения/имени мандалы
  let title_input = document.querySelector("#title_input")
  //вывод в заголовок обработанного текста
  title_input.value = input_string
  
  ///number_of_symbols
  //количество символов для расширения/сужения мандалы
  let number_of_symbols = document.querySelector("#number_of_symbols")
  //задание дефолтных значений поля ввода количества символов
  number_of_symbols.placeholder = title_input.value.length
  number_of_symbols.max = max_expansion_length

  ///clear_button
  //кнопка очистки значений и фокусировка на поле ввода
  let clear_button = document.querySelector("#clear_button")

  ///selected mandalas type
  //селект для выбора типа мандалы
  let selected_mandala_type = document.querySelector("#select_mandala_type")
  //задание дефолтных значений
  select_mandala_type.value = selected_mandala

  ///numeric_adaptation
  //справочная строка под title`ом
  let numeric_adaptation = document.querySelector("#numeric_adaptation")

  ////////////////////////////////////////////////////////////////
  ///события/////////////////////////////////////////////////////


  //контроль ввода цифровых значений
  number_of_symbols.oninput = function() {
    //убираем ввод недопустимых символов
    number_of_symbols.value = number_of_symbols.value.delete_all_spaces()
    //удаляем первый ноль
    if (number_of_symbols.value == 0) number_of_symbols.value = ""
    //предотвращаем ввод от руки большого значения
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
    number_of_symbols.value = ""
  }
  
  //очистка поля title_input
  clear_button.onclick = () => {
    title_input.value = ""
    number_of_symbols.value = ""
    number_of_symbols.placeholder = 0
    let todo_focus_wrap = () => title_input.focus()
    todo_focus_wrap()
    }
  
  //перезапуск по выбору типа мандалы
  selected_mandala_type.oninput = function() { reinit() }
  
  //пересборка мандалы по нажанию Enter в полях ввода
  title_input.onkeydown = onEnter
  number_of_symbols.onkeydown = onEnter

  function onEnter(e) {

    if (e.key == "Enter") reinit()

    if (e.key == "ArrowUp" || e.key == "ArrowDown") number_of_symbols_changer_from_current()

    function number_of_symbols_changer_from_current() {
      //если поле пустое, то отсчет ведется от длины введенного текста
      if (!number_of_symbols.value) number_of_symbols.value = title_input.value.length

      //добавление манипуляций с количеством из поля ввода имени мандалы
      if (e.target.id == title_input.id)
        if (e.key == "ArrowUp" && number_of_symbols.value < max_expansion_length)
          ++number_of_symbols.value
        else if (e.key == "ArrowDown" && number_of_symbols.value > 1)
          --number_of_symbols.value
      }

  }

  //нажатие кнопки сортировки статы
  statistic_sort_button.onclick = function() {
    //смена класса для визуализации параметров статы
    statistic_sort_button.classList.toggle("up")
    //сортировка
    statistic_button__sort()
    //перекрашивание кнопок по изменившемуся значению
    palitra_button__colored()
    //переотметка неактивных визуально кубов
    palitra_button__unactive_visibler([...axis,...plain_x_cube], "unactive_visual_button")
    //проверка на нулевые значения статы
    palitra_button__check_unactive("unactive_static_button")
  }

 
  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  //функция перезапуска мандалы с новыми данными//
  function reinit() {

      //зачистка памяти
      remove_all_objects_from_memory(axis)
      remove_all_objects_from_memory(plain_x_cube)
      if (border) remove_all_objects_from_memory(border)
      if (scale_border) {
        scene.remove( scale_border )
        scale_border = null }

      //обработка введенной строки
      input_string = modification_to_normal(title_input.value)
      //дополнительная проверка на ошибки при вводе значений количетва символов
      let number_of_symbols_correct = +number_of_symbols.value || input_string.length

      //перезапуск
      init(select_mandala_type.value, input_string, number_of_symbols_correct )
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  

  //////////////////////////////////////////////////////////////
  /////// Блок адаптации букв в цифровой код //////////////////
  ////////////////////////////////////////////////////////////
  
  //символы расположены строго по таблице (удачно получилось то, что нужен всего один пробел)
  let simbols_static = "abcdefghijklmnopqrstuvwxyz абвгдеёжзийклмнопрстуфхцчшщъыьэюя"

  let string_for_algorithms = input_string.to_array_of_numbers(simbols_static)

  //изменяет размер обрабатываемой числовой строки
  string_for_algorithms = string_for_algorithms_to_number_of_symbols(string_for_algorithms, number_of_symbols_resize)

  //добавляется нулевой элемент суммы всех чисел по фибоначи
  let summ_to_zero_element = to_one_fibbonachi_digit( string_for_algorithms.reduce( (sum,n) => sum+n ))
  //в начало массива
  string_for_algorithms.unshift( summ_to_zero_element )


  //отображение чисто цифрового значения с суммой под title
  let numeric_adaptation_text = string_for_algorithms.toString().delete_all_spaces() +
                                " = " +
                                string_for_algorithms[0]
  //удаление суммарной цифры из начала строки
  numeric_adaptation.innerHTML = numeric_adaptation_text.slice(1)



  ///////////ВЫБОР АЛГОРИТМА РАСЧЁТА///////////
  //высчитываем двумерный массив цветов для одной стороны мандалы
  let plane_of_colors = []

  if ( selected_mandala.true_of(4) )
    plane_of_colors = plane_square_3x_algorithm( string_for_algorithms )

  if ( selected_mandala.true_of(3) )
    plane_of_colors = curtail_diamond_algorithm( plane_square_3x_algorithm( string_for_algorithms ) )

  if ( selected_mandala.true_of(8,9) )
    plane_of_colors = chess_algorithm ( string_for_algorithms,
                                        selected_mandala.true_of(9) //передается boolean для второго расчёта оси
                                      )

  ///////////////////////////////////////////////////////////////////////////////
  //////////////// задание и визуализация объектов /////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
  
  //задаём ось
  let axis = axis_visual( plane_of_colors[0] )

  //пластины между осями
  let plain_x_cube = plain_x_cube_visual(plane_of_colors)

  //массив для элементов обводки мандалы
  let border = border_visual(plane_of_colors[0])

  //массив для поворота и изменения размера обводки в мандале "ромб"
  let scale_border = selected_mandala.true_of(3) ? x_border_visual(border) : null
  
  
  ////анимация объектов////////////////////
  if (!+value_init) animate()

  
  //отслеживание нажатия кнопок боковой панели и передача содержимого этих кнопок
  for (let i = 0; i < palitra.length; i++) {
    palitra[i].onmousedown = (event) => selected_button(event.target.innerHTML) //передача в функцию визуального содержимого кнопки
  }

  //подсчёт статистики и его отображение
  statistic__value_counter([...axis,...plain_x_cube])

  //затемнение неактивных кнопок на основе статы
  palitra_button__unactive_visibler([...axis,...plain_x_cube], "unactive_visual_button")

  //запуск изменения формы кнопок при проверке девизуализации
  palitra_button__check_unactive("unactive_static_button")


  //\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//
  //\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//
  //\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//

  //КОНЕЦ ОСНОВНОГО БЛОКА, ДАЛЬШЕ ТОЛЬКО ФУНКЦИИ//

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  ///МАНИПУЛЯЦИИ С ПРИМЕНЕНИЕМ И ОСЛЕЖИВАНИЕМ СОБЫТИЙ НАЖАТИЯ НА ОБЪЕКТЫ И КНОПКИ НА БОКОВОЙ ПАНЕЛИ///
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  ////функция проверки нажатой кнопки боковых панелей
  function selected_button(selected_html_content) { //передаётся символ внутри кнопки

    //функция перебора массива с отслеживанием нажатых кнопок
    function toggle_visibler(arr) { //в ф-цию передаем массив
      arr.forEach(function(item) { //перебираем массив
          if (selected_html_content === "#") item.visible = false //все искомые элементы становятся невидимыми
          if (selected_html_content === "@" ||
             +selected_html_content === +item.colornum ) item.visible = !item.visible //смена видимости на невидимость
          if (selected_html_content === "A") item.visible = true //все искомые элементы становятся видимыми
        })
    }


    //запуск девизуализации осей и плоскостей
    toggle_visibler([...axis,...plain_x_cube])
    //запуск изменения формы кнопок при нажатии девизуализации
    palitra_button__unactive_visibler([...axis,...plain_x_cube], "unactive_visual_button")

    //дополнительно статистика на "S"
    if (selected_html_content === "S") { //отобразить/спрятать
      
      statistic.classList.toggle("active")

      //при девизуализации статы, кнопки цвета возвращаются на свои места
      if (statistic.className != "active") {

        //возврат и перекрас кнопок цвета
        palitra_button__default_pos_value()
        palitra_button__colored()

        //переподсчёт статы по новым положениям кнопок
        statistic_item__zero()
        statistic__value_counter([...axis,...plain_x_cube])

        //применение доп.эффектов на кнопки цвета на основе данных статы
        palitra_button__unactive_visibler([...axis,...plain_x_cube], "unactive_visual_button")
        palitra_button__check_unactive("unactive_static_button")

      }
    }

    //смена цвета для бордера//
    if (selected_html_content === "B") border.forEach( function(entry) { 
      entry.colornum = (+entry.colornum === 9 ) ? 0 : ++entry.colornum //перебор цвета в замкнутом цикле 9 и смена значения
      entry.material.color.set(basic_colors[entry.colornum]) //присвоение значения цвета
      })

    //отображение бордера//
    if (selected_html_content === "b") {
      border.forEach( function(entry) { entry.visible = !entry.visible } )
      "unactive_static_button"
    }
    
    //отдаление/приближение//
    if (selected_html_content === "+") camera.position.z = camera.position.z - 10
    if (selected_html_content === "-") camera.position.z = camera.position.z + 10
    
  }


  //обнуление значений статы
  function statistic_item__zero() {
    for (let i = 1; i < statistic_item.length; i++) statistic_item[i].innerHTML = 0
  }
  
  //возвращение кнопок на дефолтное значение
  function palitra_button__default_pos_value() {
    for (let i = 1; i < 10; i++) palitra[i].innerHTML = i
  }
  
  //окрашиваем кнопки визуализации цветов
  function palitra_button__colored() {
    palitra.forEach( (palitra_item) => palitra_item.style.background = basic_colors[palitra_item.innerHTML] )
  }
  
  //затемнение неактивных кнопок на основе статы
  function palitra_button__check_unactive(unactive_class) {

    for (let i = 1; i < 10; i++) {

      palitra[i].classList.remove(unactive_class)

      if (statistic_item[i].innerHTML == 0) palitra[i].classList.toggle(unactive_class)
    }

  }

  //запуск изменения формы кнопок при проверке девизуализации
  function palitra_button__unactive_visibler(arr, unactive_visual_class) {
   
    for (let i=1; i < 10; i++) {

      palitra[i].classList.remove(unactive_visual_class)
   
      let visible_of = (element) => element.colornum == palitra[i].innerHTML && element.visible == false

      if (arr.some(visible_of)) palitra[i].classList.add(unactive_visual_class)
    }

  }


  ///подсчёт статистики
  function statistic__value_counter(objects_to_count) {

    for (let i = 0; i < objects_to_count.length; i++)
      if (objects_to_count[i].colornum !== 0) //ноль не считаем
        statistic_item[objects_to_count[i].colornum].innerHTML =
          ++statistic_item[objects_to_count[i].colornum].innerHTML

  }//манипуляция с DOM объектами statistic_item


  //запуск сортировки по возрастанию/убыванию со сменой значения кнопок цвета
  function statistic_button__sort() {
      
    let buffer_sort_arr = []
    
    for (let i = 1; i < 10; i++) {
      
      let buffer_sort_item = {
        value : statistic_item[i].innerHTML,
        position : palitra[i].innerHTML
      }

      buffer_sort_arr.push(buffer_sort_item)
    }

    //сама сортировка
    buffer_sort_arr.sort(function(a, b) { return a.value - b.value })
    //зеркальная пересборка массива сотрировки
    if (statistic_sort_button.className == "up") buffer_sort_arr.reverse()

    for (let i = 1; i < 10; i++) {
    
      statistic_item[i].innerHTML = buffer_sort_arr[i-1].value
      palitra[i].innerHTML = buffer_sort_arr[i-1].position
    }

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
  function modification_to_normal(string_from_user_input, string_by_default) {
  //принимает две строки, string_from_user_input - на обработку
  //string_by_default - на замену, если string_from_user_input оказалась false
  
    return  (
              !string_from_user_input ||
              !string_from_user_input.trim() ||
              +string_from_user_input == 0
            ) ? //проверка string_from_user_input на значения приводящие к false (в том числе пустая строка после сброса пробелов)
                //присваивается значение по умолчанию //и (на всякий случай) обрабатывается и оно
                modification_to_normal( string_by_default, "0123456789" )
              : 
                string_from_user_input
                  .delete_all_spaces() //убираем все пробелы
                  .slice( 0, max_input_length )        //обрезание более 30ти символов
                  .toLowerCase()     //убираем верхний регистр
  }//возвращает обработанную строку без пробелов меньше max_input_length символов в нижнем регистре либо обработанную тестовую строку


  ////функция пересборки цифрового кода строки до нужного количества цифр
  function string_for_algorithms_to_number_of_symbols(input_array_fn, number_of_symbols_fn) {

    //сужение по Урсуле
    function minus(minarray, mlength) {//массив и количество нужных чисел
      let minus_one = []
      for (let i=0; i < minarray.length-1; i++)
        minus_one.push(to_one_fibbonachi_digit(minarray[i]+minarray[i+1]))

      return (minus_one.length == mlength) ? minus_one : minus(minus_one, mlength)
    }//возвращает сужаемый до нужного количества цифр массив

    //расширение по суммам между каждым числом (одна итерация => (123) = (13253))
    function another_plus(another_plus_array, alength) {
      let another_one = []
      //первый символ добавляется автоматически
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
    if (input_array_fn.length != 1 && //блокируем расширение одного символа
          number_of_symbols_fn > input_array_fn.length) {

        // массив расширяется на порядок (lenght*2-1)
        input_array_fn = another_plus(input_array_fn, number_of_symbols_fn)
        
        //сокращаем до нужной длины по стандартному алгоритму
        if (input_array_fn.length != number_of_symbols_fn)
          input_array_fn = minus(input_array_fn, number_of_symbols_fn)
        }

    return input_array_fn
  }


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
    for (let i=1; i < input_nums_in_fn.length; i++) {
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


  //алгоритм для мадалы "ромб"
  function curtail_diamond_algorithm(plane_of_colors_in_fn) {

    let diamond_matrix = [...plane_of_colors_in_fn]

    //краткое описание: происходит "заворачивание" углов квадратной мандалы
    // суммированием от крайних элементов к середине
    for (let x=1; x < plane_of_colors_in_fn.length-1; x++)
      for (let y=1; y < plane_of_colors_in_fn.length-x; y++) {
      diamond_matrix[x][y] = to_one_fibbonachi_digit(
          plane_of_colors_in_fn[x][y]+
          plane_of_colors_in_fn[plane_of_colors_in_fn.length-x][plane_of_colors_in_fn.length-y]
          )
      diamond_matrix[plane_of_colors_in_fn.length-x][plane_of_colors_in_fn.length-y] = 0
      }
    
    return diamond_matrix
  }

  ////////алгоритм сбора мандалы по шахматной схеме/////////////////////////////
  function chess_algorithm(input_nums_fn, mirror_variant = false ) {//принимает одномерный массив чисел, созданных из введенной строки и модификатор стиля отображения косой оси

    //косая ось шахматного подсчёта
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
      //присваиваем значение цвета из принятого массива
      color_n = input_nums_fn[i]

      //направо
      axis_fn.push( cubus_construct( i,0,0, color_n) )
      //вверх
      axis_fn.push( cubus_construct( 0,i,0, color_n) )
      //налево
      axis_fn.push( cubus_construct( -i,0,0, color_n) )
      //вниз
      axis_fn.push( cubus_construct( 0,-i,0, color_n) )

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

        //верх-право
        plain_x_cube_fn.push( cubus_construct ( y, x, 0, color_n) )
        //низ-лево
        plain_x_cube_fn.push( cubus_construct ( -y, -x, 0, color_n) )
        //верх-лево
        plain_x_cube_fn.push( cubus_construct ( -x, y, 0, color_n) )
        //низ-право
        plain_x_cube_fn.push( cubus_construct ( x, -y, 0, color_n) )
      }

    return plain_x_cube_fn
  }//возвращает одномерный массив объектов

  //поворот и уменьшение стандартной обводки для мандалы "ромб"
  function x_border_visual(border_in_fn) {
    
    //создание группы
    let x_border = new THREE.Group()
    
    //уменьшение повернутой обводки (0.75 идеальное значение для 8 символов, от него и "скакал")
    let scale_p = 0.75 - Math.atan((string_for_algorithms.length-9))/50 //c применением арктангенс/коэффициэнта

    //сама группирока объекта из элементов бордюра
    border_in_fn.forEach(function(item) {x_border.add(item)} )
    
    scene.add(x_border)
    //поворот на 45градусов
    x_border.rotation.z = THREE.Math.degToRad( 45 )
    //приближаем объект для визуального перекрытия "зубцов"
    x_border.position.set(0,0,0.5)
    //изменение размера
    x_border.scale.set(scale_p,scale_p,scale_p)

    //перекрас в белый цвет
    border_in_fn.forEach( function(entry) { entry.material.color.set(basic_colors[0]) } )

    return x_border
  }


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