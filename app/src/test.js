/**
 * Created by yarden on 6/29/16.
 */

let x = 0;

function bar() {
  console.log('bar:', x);
  x++;
}


function test() {
  // foo();
  bar();
}

test();

function foo() {
  console.log('foo');
}

export {bar, foo, x};



// foo();