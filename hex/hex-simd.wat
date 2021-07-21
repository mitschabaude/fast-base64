(module
  (import "imports" "memory" (memory 0))

  (import "imports" "log" (func $log16
    (param i32) (param i32) (param i32) (param i32) (param i32) (param i32) (param i32) (param i32)
    (param i32) (param i32) (param i32) (param i32) (param i32) (param i32) (param i32) (param i32)
  ))
  (import "imports" "log" (func $log8
    (param i32) (param i32) (param i32) (param i32) (param i32) (param i32) (param i32) (param i32)
  ))

  (func $hex2bytes (export "hex2bytes")
    (param $n i32)
    ;; for (let i = 0, j = 0; i < n; i += 2, j++) {
    ;;   M[j] = char2num(M[i]) * 16 + char2num(M[i+1])
    ;; }
    ;; always for 8 i,j at the same time

    (local $x v128)
    (local $i i32)
    (local $j i32)

    (local.set $i (i32.const 0))
    (local.set $j (i32.const 0))

    loop $for
      local.get $i
      v128.load
      
      ;; convert hex char code to number in the range 0-15
      ;; e.g. code("0") => 0, code("a") => 10
      ;; x => x - 48 - ((x > 60) & 39)
      local.set $x
      local.get $x
      (i8x16.splat (i32.const 48))
      i8x16.sub
      (v128.and
        (i8x16.gt_u (local.get $x) (i8x16.splat (i32.const 60)))
        (i8x16.splat (i32.const 39))
      )
      i8x16.sub

      ;; convert encoding with 4 bits per byte to normal 8 bits
      ;; e.g. 01 02 0A 0B => 12 AB
      local.set $x
      local.get $x
      i32.const 0x0f00
      i16x8.splat
      v128.and ;; 00 02 00 0B

      local.get $x
      i32.const 0x000f
      i16x8.splat
      v128.and ;; 01 00 0A 00
      i32.const 12
      i16x8.shl ;; 00 10 00 A0
      
      v128.or ;; 00 12 00 AB

      v128.const i8x16 1 3 5 7 9 11 13 15 16 16 16 16 16 16 16 16
      i8x16.swizzle ;; 12 AB

      ;; 
      local.set $x
      local.get $j
      local.get $x
      v128.store

      ;; i += 16, j += 8, continue if i < n
      (local.set $i (i32.add (local.get $i) (i32.const 16)))
      (local.set $j (i32.add (local.get $j) (i32.const 8)))
      (i32.lt_u (local.get $i) (local.get $n))
      br_if $for
    end 
  )

  ;; convert encoding with 4 bits per byte to normal 8 bits (v128 -> v128)
  ;; we have different variants of combining the bits, they all seem to be similar in speed
  ;; (inlining the call makes a far bigger difference than switching between them)

  (func $4to8_and_shift_swizzle (param $x v128) (result v128)
    ;; e.g. 01 02 0A 0B => 12 AB
    local.get $x
    i32.const 0x0f00
    i16x8.splat
    v128.and ;; 00 02 00 0B

    local.get $x
    i32.const 0x000f
    i16x8.splat
    v128.and ;; 01 00 0A 00
    i32.const 12
    i16x8.shl ;; 00 10 00 A0
    
    v128.or ;; 00 12 00 AB

    v128.const i8x16 1 3 5 7 9 11 13 15 16 16 16 16 16 16 16 16
    i8x16.swizzle ;; 12 AB
  )

  (func $4to8_and_shift_swizzle_2 (param $x v128) (result v128)
    ;; e.g. 01 02 0A 0B => 12 AB
    local.get $x
    i32.const 0x0f00
    i16x8.splat
    v128.and ;; 00 02 00 0B
    i32.const 8
    i16x8.shr_u ;; 02 00 0B 00

    local.get $x
    i32.const 0x000f
    i16x8.splat
    v128.and ;; 01 00 0A 00
    i32.const 4
    i16x8.shl ;; 10 00 A0 00
    
    v128.or ;; 12 00 AB 00

    v128.const i8x16 0 2 4 6 8 10 12 14 16 16 16 16 16 16 16 16
    i8x16.swizzle ;; 12 AB 
  )

  (func $4to8_and_pairwiseadd (param $x v128) (result v128)
    local.get $x
    i32.const 0x0f00
    i16x8.splat
    v128.and

    local.get $x
    i32.const 0x000f
    i16x8.splat
    v128.and
    i32.const 4
    i16x8.shl
    
    v128.or
    i16x8.extadd_pairwise_i8x16_u

    v128.const i32x4 0 0 0 0
    i8x16.narrow_i16x8_u
  )

  (func $4to8_swizzle_extend_add (param $x v128) (result v128)
    local.get $x
    v128.const i8x16 0 2 4 6 8 10 12 14 1 3 5 7 9 11 13 15
    i8x16.swizzle
    
    local.set $x
    local.get $x
    i16x8.extend_low_i8x16_u
    i32.const 4
    i16x8.shl

    local.get $x
    i16x8.extend_high_i8x16_u

    i16x8.add

    v128.const i32x4 0 0 0 0
    i8x16.narrow_i16x8_u
  )

  (func $4to8_swizzle_swizzle_add (param $x v128) (result v128)
    local.get $x
    i32.const 4
    i8x16.shl
    v128.const i8x16 0 2 4 6 8 10 12 14 16 16 16 16 16 16 16 16
    i8x16.swizzle

    local.get $x
    v128.const i8x16 1 3 5 7 9 11 13 15 16 16 16 16 16 16 16 16
    i8x16.swizzle

    i8x16.add
  )

  (func $4to8_shift_only (param $x v128) (result v128)
    ;; e.g. 00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f
    ;; =>   01 23 45 67 89 ab cd ef
    local.get $x
    i32.const 4
    i8x16.shl ;; 00 10 20 30 40 50 60 70 80 90 a0 b0 c0 d0 e0 f0
    local.set $x

    local.get $x
    i32.const 0x00f0
    i16x8.splat
    v128.and ;; 00 00, 20 00, 40 00, 60 00, 80 00, a0 00, c0 00, e0 00

    local.get $x
    i32.const 0xf000
    i16x8.splat
    v128.and ;; 00 10, 00 30, 00 50, 00 70, 00 90, 00 b0, 00 d0, 00 f0
    i32.const 12
    i16x8.shr_u ;; 01 00, 03 00, 05 00, 07 00, 09 00, 0b 00, 0d 00, 0f 00
    
    v128.or ;; 01 00 23 00, 45 00 67 00, 89 00 ab 00, cd 00 ef 00
    local.set $x

    local.get $x
    i32.const 0x000000ff
    i32x4.splat
    v128.and ;; 01 00 00 00, 45 00 00 00, 89 00 00 00, cd 00 00 00

    local.get $x
    i32.const 0x00ff0000
    i32x4.splat
    v128.and ;; 00 00 23 00, 00 00 67 00, 00 00 ab 00, 00 00 ef 00
    i32.const 8
    i32x4.shr_u ;; 00 23 00 00, 00 67 00 00, 00 ab 00 00, 00 ef 00 00

    v128.or ;; 01 23 00 00 45 67 00 00, 89 ab 00 00 cd ef 00 00
    local.set $x

    local.get $x
    v128.const i32x4 0x0000ffff 0x00000000 0x0000ffff 0x00000000
    v128.and ;; 01 23 00 00 00 00 00 00, 89 ab 00 00 00 00 00 00

    local.get $x
    v128.const i32x4 0x00000000 0x0000ffff 0x00000000 0x0000ffff
    v128.and ;; 00 00 00 00 45 67 00 00, 00 00 00 00 cd ef 00 00
    i32.const 16
    i64x2.shr_u

    v128.or ;; 01 23 45 67, 00 00 00 00, 89 ab cd ef, 00 00 00 00
    local.set $x

    local.get $x
    local.get $x
    i32x4.extract_lane 2
    i32x4.replace_lane 1
  )

  (func $log8x16 (param $x v128)
    local.get $x
    i8x16.extract_lane_u 0
    local.get $x
    i8x16.extract_lane_u 1
    local.get $x
    i8x16.extract_lane_u 2
    local.get $x
    i8x16.extract_lane_u 3
    local.get $x
    i8x16.extract_lane_u 4
    local.get $x
    i8x16.extract_lane_u 5
    local.get $x
    i8x16.extract_lane_u 6
    local.get $x
    i8x16.extract_lane_u 7
    local.get $x
    i8x16.extract_lane_u 8
    local.get $x
    i8x16.extract_lane_u 9
    local.get $x
    i8x16.extract_lane_u 10
    local.get $x
    i8x16.extract_lane_u 11
    local.get $x
    i8x16.extract_lane_u 12
    local.get $x
    i8x16.extract_lane_u 13
    local.get $x
    i8x16.extract_lane_u 14
    local.get $x
    i8x16.extract_lane_u 15
    call $log16
  )
   (func $log16x8 (param $x v128)
    local.get $x
    i16x8.extract_lane_u 0
    local.get $x
    i16x8.extract_lane_u 1
    local.get $x
    i16x8.extract_lane_u 2
    local.get $x
    i16x8.extract_lane_u 3
    local.get $x
    i16x8.extract_lane_u 4
    local.get $x
    i16x8.extract_lane_u 5
    local.get $x
    i16x8.extract_lane_u 6
    local.get $x
    i16x8.extract_lane_u 7
    call $log8
  )
)
