*****************************
*                           *
*  URLCompressorライブラリ  *
*                           *
*      Version 0.1.0        *
*                           *
*****************************

=== URLCompressorライブラリとは ===

  アクセスするサイトに、URLパラメータ(クエリ文字列)を使って多くの情報を
渡そうとする場合には、渡したい情報をいかに効率よくエンコードするかが問
題となります。

URLCompressorライブラリは、URLに埋め込みたい情報を圧縮して、効率良くエ
ンコードするための、JavaScriptで記述されたライブラリです。

例えばhttps://example.comというサイトにアクセスする場合に、"本日は晴天
なり。"という文字列を送るとすると、パーセントエンコーディング(URLエン
コード)では

https://example.com?text=%E6%9C%AC%E6%97%A5%E3%81%AF%E6%99%B4%E5%A4%A9%E3%81%AA%E3%82%8A%E3%80%82

と、非常に長いURLになります。一方で、同じ文字列をURLCompressorライブラ
リを使って送れば、

https://example.com?text=DiX8ReaZzrfpP4jxuH4JVY0ne47QHoZ

と、比較的短いURLで情報を送れます。

URLCompressorライブラリは、19kB程度のJavaScriptのコードで、minifyすれ
ば、わずか6kB程度になります。軽量なので、WEBページに組み込んでも、読み
込みに時間がかかりません。

URLCompressorライブラリは、デフォルトではURLパラメータに使える64種類の
文字を使って圧縮しますが、バイナリで圧縮する事もできるので、
URLCompressorライブラリを、ファイル圧縮のために使用する事もできます。

=== 配布場所 ===

  URLCompressorライブラリは、次のページでダウンロードできます。

  https://synapse.kyoto/lib/URLCompressor/page001.html

=== ライセンス ===

  URLCompressorライブラリは、MITライセンスで配布しています。

=== 同梱されているファイルの内容 ===

・url-comp.js … URLCompressorの本体のファイルです。
・convert.js … 文字列のエンコード・デコードのサンプルプログラムです。
・convert.html … convert.jsと組み合わせて使うHTMLファイルです。
・compress.html … ファイル圧縮のサンプルプログラムです。
・expand.html … ファイル伸長のサンプルプログラムです。
・readme.txt … このファイルです。

=== サンプルプログラムの使い方 ===

  このアーカイブには、convert.htmlとcompress.htmlとexpand.htmlの3つの
サンプルプログラムがあります。これらのサンプルプログラムの使い方を順に
説明します。

* convert.htmlの使い方

  convert.htmlは、URLCompressorライブラリを使って、文字列をエンコード(
圧縮)する方法と、文字列をデコード(伸長)する方法を示すためのサンプルプ
ログラムです。
  convert.htmlは、文字列を入力してそれをエンコードしたり、デコードした
りします。URLCompressorライブラリを使ったエンコード・デコードの他にも、
インターネットで一般的に使われている、パーセントエンコーディングやBase 
64 URLによるエンコードやデコードも行えますので、各エンコード方式の効率
の比較にも使用する事ができます。
  convert.htmlを使うには、起動済みのブラウザにcomvert.htmlをドラッグ&
ドロップするなどしてconvert.htmlを開いてください。開いた画面に、詳しい
使い方が記載されています。
  なおconvert.htmlを使うには、data-comp.jsとconvert.jsが同じフォルダに
入っている必要があります。

* compress.htmlの使い方

  compress.htmlは、URLCompressorライブラリを使って、ファイルを圧縮す
る方法を示すためのサンプルプログラムです。
  compress.htmlを開いて、画面でローカルマシン内のファイルを選択すると、
そのファイルを圧縮し、圧縮済みのファイルをダウンロードします。(ダウン
ロードといっても、実際にはサーバーから圧縮済みファイルが送られてくるわ
けではなく、ローカルマシン内で生成したファイルを保存するだけです。ブラ
ウザのダウンロードの機能を使ってファイルを保存するので、ここではダウン
ロードと呼んでいます。)
  compress.htmlでのファイル圧縮は、単一のファイルを圧縮する(ファイルの
サイズを低減する)機能だけを提供します。ZIPなどの圧縮ソフトの様に、複数
のファイルを一つのアーカイブにまとめる機能はありません。
  compress.htmlを使うには、起動済みのブラウザにcompress.htmlをドラッグ
&ドロップするなどしてcompress.htmlを開いてください。開いた画面に、簡単
な使い方が記載されています。

* expand.htmlの使い方

  expand.htmlは、URLCompressorライブラリを使って、ファイルを伸長する方
法を示すためのサンプルプログラムです。
  expand.htmlを開いて、画面でローカルマシン内にある、以前にcompress.html
で圧縮されたファイルを選択すると、そのファイルを伸長し、伸長済みのファ
イルをダウンロードします。(ダウンロードといっても、実際にはサーバーか
ら伸長済みファイルが送られてくるわけではなく、ローカルマシン内で生成し
たファイルを保存するだけです。ブラウザのダウンロードの機能を使ってファ
イルを保存するので、ここではダウンロードと呼んでいます。)
  expand.htmlを使うには、起動済みのブラウザにexpand.htmlをドラッグ&ド
ロップするなどしてcompress.htmlを開いてください。開いた画面に、簡単な
使い方が記載されています。

=== URLCompressorライブラリの使い方 ===

* 概要

  WEBページのクライアントサイドでURLCompressorライブラリを使うには、HTML
でurl-comp.jsを読み込む必要があります。例えば、HEAD要素内でurl-comp.js
を読み込むには、

  <script src="url-comp.js" defer></script>

などと記述します。
  URLCompressorライブラリの内部では、URLCompressorというオブジェクト変
数を定義しています。(ライブラリと同名の変数)
  このURLCompressorオブジェクトには、次の4つのメソッド(関数)があります。

  ・URLCompressor.compress関数
  ・URLCompressor.expand関数
  ・URLCompressor.encodeUtf8関数
  ・URLCompressor.decodeUtf8関数

  これら4つの関数の内、圧縮(エンコード)と伸長(デコード)に使うのは
URLCompressor.compress関数と、URLCompressor.expand関数の2つです。
URLCompressor.encodeUtf8関数とURLCompressor.decodeUtf8関数の2つは、
URLCompressorライブラリ内部で使用している関数なのですが、汎用性があるの
で、外部からも利用できる様にしています。

* URLCompressor.compress関数の使い方

  URLCompressor.compress関数は、文字列を圧縮(エンコード)します。
  URLCompressor.compress関数の書式を次に示します。

  書式: URLCompressor.compress(str,encode64)

  URLCompressor.compress関数には、strとencode64の2つの引数があります。
  第1引数のstrには、圧縮したい文字列を渡します。文字列はUTF-16表現とし
て正しい物である必要があります。前半サロゲートの後に後半サロゲートがな
い、不正なUTF-16表現の文字列は圧縮できません。
  第2引数のencode64は、圧縮結果をBase 64 URL形式の文字列にするかどう
かを示す論理型(trueまたはfalse)の引数です。
  encode64がtrueなら、圧縮結果をBase 64 URL形式の文字列(英数字と-と_の、
URLとして使える64文字のみからなる文字列)で返します。
  encode64がfalseなら、圧縮結果をバイナリ文字列(文字コードが0～255の範
囲の文字からなる文字列)で返します。
  encode64の指定を省略すると、trueを指定したものとして解釈されます。
  URLCompressor.compress関数の返り値は、圧縮済みの文字列になります。
  ただし、圧縮処理でエラーが発生した場合は、返り値がnullになります。(
エラーになっても例外は発生しません)

* URLCompressor.expand関数の使い方

  URLCompressor.expand関数は、DataCompressor.compress関数によって圧縮
された文字列を伸長(デコード)し、元の文字列に戻します。
  URLCompressor.expand関数の書式を次に示します。
  
  書式: URLCompressor.expand(str,decode64)

  URLCompressor.expand関数には、strとdecode64の2つの引数があります。
  第1引数のstrには、伸長したい文字列を渡します。
  第2引数のdecode64は、strとして渡した文字列が、Base 64 URL形式の文字
列であるのかどうかを示す、論理型(trueまたはfalse)の引数です。
  decode64がtrueなら、strはBase 64 URL形式の文字列であるとみなして伸長
します。
  decode64がfalseなら、strはバイナリ文字列であるとみなして伸長します。
  decode64の指定を省略すると、trueを指定したものとして解釈されます。
  圧縮時にURLCompressor.compress関数の第2引数(encode64)に指定したのと
同じ真理値を、URLCompressor.expand関数の第2引数(decode64)に指定する必
要があります。
  URLCompressor.expand関数の返り値は、伸長済みの文字列になります。
  ただし、伸長処理でエラーが発生した場合は、返り値がnullになります。(
エラーになっても例外は発生しません)

* URLCompressor.encodeUtf8関数の使い方

  URLCompressor.encodeUtf8関数は、UTF-16表現された、標準的なJavaScriptの
文字列を、UTF-8表現の文字列に変換します。
  JavaScript標準のTextEncoder.prototype.encode関数でも、UTF-16からUTF-8
への変換ができますが、TextEncoder.prototype.encode関数では、UTF-8に変
換された文字列が、Uint8Arrayで返って来るのに対し、URLCompressor.encodeUtf8
関数では文字列で返ってくる点が違います。
  URLCompressor.encodeUtf8関数の書式を次に示します。

  書式: URLCompressor.encodeUtf8(str)

  引数のstrにはUTF-16表現の文字列を渡します。
  返り値は、UTF-8表現された文字列(文字コードは0～255の範囲)です。
  ただし、UTF-16からUTF-8への変換の最中にエラーが発生した場合は、nullを
返します。(エラーになっても例外は発生しません)

* URLCompressor.decodeUtf8関数の使い方

  URLCompressor.decodeUtf8関数は、URLCompressor.encodeUtf8関数で生成さ
れたUTF-8表現の文字列を、Javascript標準のUTF-16表現の文字列に変換しま
す。
  JavaScript標準のTextDecoder.prototype.decode関数でも、UTF-8からUTF-16
への変換ができますが、TextEncode.prototype.decode関数では、ArrayBufferや
ArrayBufferViewを引数に取るのに対し、URLCompressor.decodeUtf8関数では文
字列を引数に取る点が違います。
  URLCompressor.decodeUtf8関数の書式を次に示します。

  書式: URLCompressor.decodeUtf8(str)

  引数のstrには、UTF-8表現の文字列を渡します。
  返り値は、UTF-16表現されたJavaScriptの標準的な文字列です。
  ただし、UTF-8からUTF-8の変換の最中にエラーが発生した場合は、nullを返
します。(エラーになっても例外は発生しません)
