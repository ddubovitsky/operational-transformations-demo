Include operations are used to transform one operation against another in order to account independent changes done by a parallel operation. 

For example: 

Given initial string of "ABCDEFG",
and two sites: s1 and s2
operation O1 generated at site S1 is Insert("123", 4)
operation O2 generated at site S2 is Delete(0, 2);
O1 is parallel to the o2, O1 and O2 is contextually equivalent

when O1 is executed at S1, the resulting string will be "ABCD123EFG",
when O2 arrives to the S1, it does not need to be transformed, and can be executed as it is,
therefore result would CD123EFG, which is correct;

when O2 is generated at site S2, the resulting string ill be "CDEFG", 
when O1 arrives at the site S1, if we execute it straight-away it will give us result of "CDEF123G", which is not correct
the original intention of O1 i.e insert "123" between "D" and "E" was not preserved due to previously executed operation. 

In order to preserve intention of O1 operation it has to be transformed to account for changes done in O2. 
In this scenario, we will have to shift position of O1 by the delete amount of O2, 
O1 = Insert("123", 4),
transformed O1 = O1' = Insert("123", O1.position - O2.amount) = Insert("123", 4 - 2) = Insert("123", 2);
and if we now execute O1', the resulting string will be "CD123EFG" which is the same as the result we got at S1
