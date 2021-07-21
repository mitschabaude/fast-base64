(module
  (import "imports" "memory" (memory 0))
  (import "imports" "log" (func $log (param i32)))

  (func $hex2bytes (export "hex2bytes")
    ;; for (let i = 0, j = 0; i < n; i += 2, j++) {
    ;;   M[j] = char2num(M[i]) * 16 + char2num(M[i+1])
    ;; }
    (param $n i32)
    (local $x i32)
    (local $i i32)
    (local $j i32)
    (local.set $i (i32.const 0))
    (local.set $j (i32.const 0))

    loop $for
      local.get $j

      (i32.load8_u (local.get $i))
      call $char2num
      i32.const 16
      i32.mul

      (i32.load8_u (i32.add (local.get $i) (i32.const 1)))
      call $char2num

      i32.add

      i32.store8

      (local.set $i (i32.add (local.get $i) (i32.const 2)))
      (local.set $j (i32.add (local.get $j) (i32.const 1)))

      (i32.ne (local.get $i) (local.get $n))
      br_if $for
    end 
  )

  (func $char2num (param $x i32) (result i32)
    ;; return x - 48 - (x > 60)*39
    (i32.sub
      (i32.sub (local.get $x) (i32.const 48))
      (i32.mul
        (i32.gt_u (local.get $x) (i32.const 60))
        (i32.const 39)
      )
    )
  )
)
