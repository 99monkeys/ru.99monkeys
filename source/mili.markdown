---
---

<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/8.4/styles/default.min.css">
<script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/8.4/highlight.min.js"></script>
<script>hljs.initHighlightingOnLoad();</script>

<style> pre { font-family: Monospace; } </style>

## 1. Скрипт загрузчик картинок с заданной страницы. Скаченные картинки попадают в папку download/{domain}
<pre><code class="bash">
## bash
./image_grabber.rb http://yandex.ru
</code></pre>
<br/>
<pre><code class="ruby">
## file : image_grabber.rb
#!/usr/bin/env ruby
require 'rubygems'
require 'nokogiri'
require 'open-uri'

#site_url    = 'http://blog.website.com/'
site_url    = ARGV.shift
folder_name = URI(site_url).host
`mkdir download/#{folder_name}`

puts "open site #{site_url}"
page = Nokogiri::HTML(open(site_url))

puts "start parsing..."
page.search('img').each_with_index do |img, index|
  full_image_url = URI.join(site_url, img['src']).to_s
  puts "#{index.next.to_s.ljust(3)} #{full_image_url}"
  filename =File.expand_path File.join("download",folder_name, File.basename(full_image_url)), File.dirname(__FILE__)
  File.open(filename, 'wb') do |f|
    f.write open(full_image_url)
  end
end
puts 'finished'
</code></pre>

#### Улучшения
* Закачивать картинки с помощью curl
* Использовать многопоточность

## 2. Поиск двух пропущщеных чисел в последовательности от 1..N
Задача решается в лоб за O(N) проходов.

Я предложил решение за O(logN) проходов. Написал некую модификацию бинарного поиска.
Идея алгоритма:
- взять серединный элемент(по индексу) и сравнить его с ожидаемым  значением(индекс и значение элемента должны совпадать)
- определяя разницу между ожидаемым числом и фактическим (разница может быть 0,1,2)  мы можем однозначно сказать по какую сторону
  расположены пропущенные значения.

<pre><code class="ruby">
N = 100
forgeted =  (1..N).to_a.sample(2)
$arr =(1..N).to_a - forgeted

puts forgeted.inspect
puts $arr.inspect

def find_word(first, last, min, max)
  return if last < first

  central      = first + ((last - first +0.5 )/2).round
  central_item = $arr[central-1]
  puts "#{first} #{last} #{min} #{max}  central:#{central} citem:#{central_item}"


  if first!=last

    if central == last && max - central_item == 2
      puts central_item + 1
    end
    if central == last && max - central_item == 3
      puts central_item + 1
      puts central_item + 2
    end

    case central_item - central
    when  1, -1
      find_word(first, central-1, min, central_item)
      find_word(central+1, last, central_item, max)
    when  2
      find_word(first, central-1,min, central_item)
    when 0
      find_word(central+1, last, central_item, max)
    end

  else
    if max - central_item == 3
      puts(central_item + 1)
      puts(central_item + 2)
    end

    if max - central_item == 2
      puts(central_item + 1)
    end

    if min - central_item == -2
      puts(central_item - 1)
    end

    if min - central_item == -3
      puts(central_item - 1)
      puts(central_item - 2)
    end
  end
end

find_word(1, N-2, 0, N+1)
</code>
</pre>

## 3. Слабые стороны Ruby

Вытекают из его же и преимуществ

- Интерпретируемый язык:  Медленный по сравнению с компилируемыми языками. Многие ошибки выявляются только входе работы программы (Runtime).
- Динамическая типизация: Больше шансов получить runtime ошибку. Невозможность отловить ошибки на этапе запуска приложения.
- Ссылочная передача объектов: вместе с динамической типизацией и использованием стороннего кода, может приводить к утечкам памяти( потери ссылки объектов, без сбора их GC).
- Автоматическая сборока мусора в памяти GC: Нет возможности гарантировать что часть кода отработает за N-ое время. Автоматически GC вносить элемент случайности в потребление памяти и процессорного времени.
- Как и большинство императивных языков не позволяет качественно масштабировать приложение на многоядерных процессорах. Написание многопоточных приложений возможно, однако создает трудности в отлаживании кода, включая RaceCondition.


## 4. Большой поток входных данных с последюущей обработкой, сохранением передачей.

Обработка, Сохранение, Дальнейшая передача могут выполняться параллельно и асинхронно. написания асинхронных и параллельных приложени с использованием Erlang делается иногда тривиально просто.
Erlang хорошо себя зарекомендовал в системах видеотрансляции, вебинары, online-чаты, биллинг, брокерские операции. Все эти задачи соответствуют описанным условиям.



## 5. Пользователи вконтакте
На хабре была статья про clickjacking вконтакте, когда frame виджета с помощью css/js подставляется под курсор и делается прозрачным.
При клике происходить добавление приложения/вступления в группу.

Посмотрел api VK.Auth.getLoginStatus(function(response) {...response.session.mid...}) это сработает но в случае если пользователь уже добавил себе приложение

Также возможно найти лазейку и через кроссдоменный запрос (jsonp) получить id пользователя. Я писал скрипт который использую jsonp идентифицировал пользователя без каких-либо действий, но сервер писал я :)

Можно попытаться воспользоваться некоторыми аномальными поведениями. Например по запросу http://m.vk.com/photos происходит редирект на http://m.vk.com/photos{user_id}
Загрузить в фрейме страницу и попытаться вернуть новый location из фрейма.

socfishing.ru обещает сделать нечто подобное за 5руб/запрос. Можно платить или сделать reverse engineering их кода. Опыт есть.


##6. 10 пользователей с максимальным числом сообщений
<pre><code class="sql">
SELECT users.id, count(1) AS counter FROM users
INNER JOIN messages ON messages.user_id = users.id
GROUP BY users.id
ORDER BY counter DESC
LIMIT 10;
</code></pre>


##7. Два списка в один.
Идея: отсортировать первый массив qsort. И далее уже добавлять элементы используя бинарный поиск
Оценка сложности алгоритма: пусть два массива имеют размерность N
тогда быстрая сортировка займет O(NlogN) и N раз добавление элемента O(logN) ~ O(2NlogN)

В качестве оптимизации можно попробывать использовать двоичную кучу, вместо сортировки.


##8. Расчет кредита

<pre><code class="ruby">
sum     = 9534
days    = 9
times   = 3
percent = 1.7

dolg = days/times * percent / 100 * sum * ( times + 1) / 2

paytime = ((sum+dolg) / times).truncate()
total   = paytime * times

puts "sum:     #{sum.to_s.rjust(10)}"
puts "days:    #{days.to_s.rjust(10)}"
puts "times:   #{times.to_s.rjust(10)}"
puts "percent  #{percent.to_s.rjust(10)}"
puts "dolg:    #{dolg.to_s.rjust(10)}"
puts "sum+dolg:#{(sum+dolg).to_s.rjust(10)}"
puts "----------"
puts "total:   #{total.to_s.rjust(10)}"
puts "paytime: #{paytime.to_s.rjust(10)}"
</code></pre>

<pre><code class="text">
## ПРИМЕР 
sum:           9534
days:             9
times:            3
percent         1.7
dolg:       972.468
sum+dolg: 10506.468
----------
total:        10506
paytime:       3502
</code></pre>


## 9. Есть запрос (структуру данных додумать)
<pre><code class="sql">
select * from comments where tag_id in (...) order by created_at desc offset n limit m;
</code></pre>
Выборка происходит по tag_id 
Данный запрос можно ускорить, если создать индекс по полю tag_id.
Для tag_id можно построить как обычный индекс (btree) с O(logN) или Hash(сюда подходит лучше тк мы не будем делать операции сравнения) со сложностью поиска O(1)

