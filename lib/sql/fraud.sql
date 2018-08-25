select    		  
          000 as Product,  
		  (dc.Decodeacctnbr)as Account_number,
		  (a.Cardnbr) as Card_number,
          a.Auth_Date as Transaction_Date,
		  a.Auth_time as Transaction_Time, 
		  g.Auth_Pos_Entry_Mode_Code as POS_Entry_Mode,
		  a.PIN_INDICATOR,
		  a.AUTH_B048_TAG_42_ECI as SecureCode,
		  f.Auth_Decision_Code as Decision,		  
		  a.Auth_Amt as Transaction_Amount, 
		  c.Auth_Merchant_Name as Merchant_Name,
		  c.Auth_Merchant_City as Merchant_City,
		  c.Auth_Merchant_State as Merchant_State,
		  c.AUTH_MERCHANT_CAT_CODE as MCC,
		  a.MERCHANT_TERMINAL_ID as Terminal_ID,
		  e.Auth_Tran_Type as Transaction_Type,
		  C.AUTH_MERCHANT_COUNTRY_CODE as Country_code,
		  A.AUTH_CODE as Auth_code		  
	   FROM
	   VPLUS.DWH_FALCON_AUTHORISATION_FACT A 
LEFT  JOIN VPLUS.DWH_FALCON_AUTHN_MRCH C ON (C.AUTH_MERCHANT_SK=A.AUTH_MERCHANT_SK) 
LEFT  JOIN VPLUS.DWH_FALCON_AUTHN_TRAN_TYPE E ON (E.AUTH_TRAN_TYPE_SK=A.AUTH_TRAN_TYPE_SK) 
LEFT  JOIN VPLUS.DWH_FALCON_AUTHN_DECN_CD F ON (F.AUTH_DECISION_SK=A.AUTH_DECISION_SK) 
LEFT  JOIN VPLUS.DWH_FALCON_ATHN_POS_ENTRY_MODE G ON (G.AUTH_POS_ENTRY_MODE_SK=A.AUTH_POS_ENTRY_MODE_SK) 
LEFT  JOIN VPLUS.DWH_DECODE_ACCOUNT DC ON (DC.ACCOUNT_KEY=A.ACCOUNT_KEY)