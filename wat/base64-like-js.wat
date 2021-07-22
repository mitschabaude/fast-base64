(module
  (import "imports" "memory" (memory 0))

  (func $base642bytes (export "base642bytes") (param $n i32) (result i32)
    (local $i i32)
    (local $j i32)
    (local $x1 i32)
    (local $x2 i32)
    (local $x3 i32)
    (local $x4 i32)

    (local.set $i (i32.const 0))
    (local.set $j (i32.const 0))

    (loop 
      local.get $j
      
      (i32.load8_u (local.get $i))
      call $char2num
      (i32.const 18)
      i32.shl
      local.tee $x1

      (i32.load8_u (i32.add (local.get $i) (i32.const 1)))
      call $char2num
      (i32.const 12)
      i32.shl
      local.tee $x2

      i32.add
      (i32.const 16)
      i32.shr_u

      i32.store8
      (local.set $j (i32.add (local.get $j) (i32.const 1)))

      local.get $j
      local.get $x2

      (i32.load8_u (i32.add (local.get $i) (i32.const 2)))
      call $char2num
      (i32.const 6)
      i32.shl
      local.tee $x3

      i32.add
      (i32.const 8)
      i32.shr_u
      (i32.const 255)
      i32.and

      i32.store8
      (local.set $j (i32.add (local.get $j) (i32.const 1)))
      
      local.get $j
      local.get $x3
      
      (i32.load8_u (i32.add (local.get $i) (i32.const 3)))
      call $char2num
      local.tee $x4

      i32.add
      (i32.const 255)
      i32.and

      i32.store8

      (local.set $i (i32.add (local.get $i) (i32.const 4)))
      (local.set $j (i32.add (local.get $j) (i32.const 1)))
      (i32.lt_u (local.get $i) (local.get $n))
      br_if 0
    )
    (local.get $j)
  )

  (func $char2num (param $x i32) (result i32)
    ;; x + 4 - (x > 64) * 69 - (x > 96) * 6 + (x === 43) * 15 + (x === 47) * 12
    local.get $x
    i32.const 4
    i32.add

    (i32.mul
      (i32.gt_u (local.get $x) (i32.const 64))
      (i32.const 69)
    )
    i32.sub

    (i32.mul
      (i32.gt_u (local.get $x) (i32.const 96))
      (i32.const 6)
    )
    i32.sub

    (i32.mul
      (i32.eq (local.get $x) (i32.const 43))
      (i32.const 15)
    )
    i32.add

    (i32.mul
      (i32.eq (local.get $x) (i32.const 47))
      (i32.const 12)
    )
    i32.add
  )

  (func $num2char (param $x i32) (result i32)
    ;; x + 65 + (x > 25) * 6 - (x > 51) * 75 - (x === 62) * 15 - (x === 63) * 12
    local.get $x
    i32.const 65
    i32.add

    (i32.mul
      (i32.gt_u (local.get $x) (i32.const 25))
      (i32.const 6)
    )
    i32.add

    (i32.mul
      (i32.gt_u (local.get $x) (i32.const 51))
      (i32.const 75)
    )
    i32.sub

    (i32.mul
      (i32.eq (local.get $x) (i32.const 62))
      (i32.const 15)
    )
    i32.sub

    (i32.mul
      (i32.eq (local.get $x) (i32.const 63))
      (i32.const 12)
    )
    i32.sub
  )
)
