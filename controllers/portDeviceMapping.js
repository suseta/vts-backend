const { getClient } = require('../db/connect')

var client

const setPortDeviceMapping = async (req, res) => {
  let {
    i_imei_no,
    i_port_no,
    prt_dvc_mp_dt,
    prt_dvc_unmp_dt
  } = req.body

  if (!i_imei_no || !i_port_no || !prt_dvc_mp_dt) {
    return res.status(400).json({
      error: 'imei no or port no cannot be empty!'
    })
  }
  if (prt_dvc_unmp_dt === '') {
    prt_dvc_unmp_dt = null;
  }
  
  try {
    const dataToInsert = {
        i_imei_no,
        i_port_no,
        prt_dvc_mp_dt,
        prt_dvc_unmp_dt
    }    

    const query = {
      text: `
                INSERT INTO port_device_mapping (
                    i_imei_no,
                    i_port_no,
                    prt_dvc_mp_dt,
                    prt_dvc_unmp_dt
                )
                VALUES ($1, $2, $3, $4)
                RETURNING *;
            `,
      values: [
        dataToInsert.i_imei_no,
        dataToInsert.i_port_no,
        dataToInsert.prt_dvc_mp_dt,
        dataToInsert.prt_dvc_unmp_dt
      ]
    }
    client = await getClient()
    try {
      const result = await client.query(query)

      const query = {
        text: `SELECT s_last_port_no FROM last_port_by_imei WHERE i_imei_no = '${dataToInsert.i_imei_no}';`,
      }; 
      
      isPortInitialized = await client.query(query);

      if(isPortInitialized.rows[0].s_last_port_no == 0){
        const query = {
          text:`insert into last_port_by_imei(i_imei_no,s_last_port_no)values($1,$2)`,values:[dataToInsert.i_imei_no,dataToInsert.i_port_no,]
        }
        lastPortInitializedForDevice = await client.query(query);
      }

      console.log('Data inserted successfully:', result.rows[0])
      res.status(200).json({
        message: 'Port Device Mapping data stored successfully!',
        data: result.rows[0]
      })
    } finally {
      await client.end()
    }
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}


const getPortDeviceMapping = async(req,res) =>{
  try{
      const imeiNo = req.query.i_imei_no;
      const query = {
          text: `SELECT i_port_no FROM port_device_mapping WHERE i_imei_no = '${imeiNo}';`,
          };
          
          client =await getClient(); 

          try {
              const result = await client.query(query);
              res.status(200).json({
                  message: 'i_port_no Fetched successfully',
                  data: result.rows
              });
          } finally {
              await client.end();
          }
  }catch(error){
      res.status(400).send({ message: error.message });
  }   
} 

const getLatestAccessPortByImei = async(req,res) =>{
  try{
      const imeiNo = req.query.i_imei_no;
      const query = {
          text: `SELECT s_last_port_no FROM last_port_by_imei WHERE i_imei_no = '${imeiNo}';`,
          };
          
          client =await getClient(); 

          try {
              const result = await client.query(query);
              res.status(200).json({
                  message: 'i_port_no Fetched successfully',
                  data: result.rows
              });
          } finally {
              await client.end();
          }
  }catch(error){
      res.status(400).send({ message: error.message });
  }   
} 


module.exports = {
    setPortDeviceMapping,
    getPortDeviceMapping,
    getLatestAccessPortByImei
}

