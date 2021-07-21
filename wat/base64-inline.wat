(module
  (import "imports" "memory" (memory 0))
  ;; (import "imports" "log" (func $log (param i32)))

  (func $base642bytes (export "base642bytes") (param $n i32) (result i32)
    (local $i i32)
    (local $j i32)
    (local $x1 i32)
    (local $x2 i32)
    (local $x3 i32)
    (local $x4 i32)
    (local $x i32)

    (local.set $i (i32.const 0))
    (local.set $j (i32.const 0))

    (loop 
      local.get $j

      (i32.load8_u (local.get $i))
      
      ;; char2num
      local.tee $x
      (i32.mul
        (i32.gt_u (local.get $x) (i32.const 47))
        (i32.const 4)
      )
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
        (i32.const 19)
      )
      i32.add

      (i32.mul
        (i32.eq (local.get $x) (i32.const 47))
        (i32.const 16)
      )
      i32.add

      (i32.const 18)
      i32.shl
      local.tee $x1

      (i32.load8_u (i32.add (local.get $i) (i32.const 1)))

      ;; char2num
      local.tee $x
      (i32.mul
        (i32.gt_u (local.get $x) (i32.const 47))
        (i32.const 4)
      )
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
        (i32.const 19)
      )
      i32.add

      (i32.mul
        (i32.eq (local.get $x) (i32.const 47))
        (i32.const 16)
      )
      i32.add

      (i32.const 12)
      i32.shl
      local.tee $x2

      i32.add
      (i32.const 16)
      i32.shr_u

      i32.store8
      (local.tee $j (i32.add (local.get $j) (i32.const 1)))
      (i32.eq (i32.add (local.get $i) (i32.const 2)) (local.get $n))
      br_if 1

      local.get $j
      local.get $x2

      (i32.load8_u (i32.add (local.get $i) (i32.const 2)))
      ;; local.set $x3
      ;; (if (i32.eq (local.get $x3) (i32.const 61)) (then (br 2 (local.get $j))))
      ;; local.get $x3
      
      ;; char2num
      local.tee $x
      (i32.mul
        (i32.gt_u (local.get $x) (i32.const 47))
        (i32.const 4)
      )
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
        (i32.const 19)
      )
      i32.add

      (i32.mul
        (i32.eq (local.get $x) (i32.const 47))
        (i32.const 16)
      )
      i32.add

      (i32.const 6)
      i32.shl
      local.tee $x3

      i32.add
      (i32.const 8)
      i32.shr_u
      (i32.const 255)
      i32.and

      i32.store8
      (local.tee $j (i32.add (local.get $j) (i32.const 1)))
      (i32.eq (i32.add (local.get $i) (i32.const 3)) (local.get $n))
      br_if 1
      
      local.get $j
      local.get $x3
      
      (i32.load8_u (i32.add (local.get $i) (i32.const 3)))
      ;; local.set $x4
      ;; (if (i32.eq (local.get $x4) (i32.const 61)) (then (br 2 (local.get $j))))
      ;; local.get $x4

      ;; char2num
      local.tee $x
      (i32.mul
        (i32.gt_u (local.get $x) (i32.const 47))
        (i32.const 4)
      )
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
        (i32.const 19)
      )
      i32.add

      (i32.mul
        (i32.eq (local.get $x) (i32.const 47))
        (i32.const 16)
      )
      i32.add

      local.tee $x4

      i32.add
      (i32.const 255)
      i32.and

      i32.store8

      (local.set $i (i32.add (local.get $i) (i32.const 4)))
      (local.tee $j (i32.add (local.get $j) (i32.const 1)))
      (i32.ge_u (local.get $i) (local.get $n))
      br_if 1
      br 0
    )
    (local.get $j)
  )
)
