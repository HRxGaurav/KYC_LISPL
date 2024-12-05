import styles from './StepToOpenAccount.module.css';


const StepToOpenAccount = () => {
  return (
    <>
    <h2 className={styles.mainHeading}>How to Open a Demat Account​?</h2>


    <div>

        <div className={styles.StepContainer}>
            <div className={styles.StepLine}></div>

            <div className={styles.StepWrapper}>


                    <div className={styles.StepCard}>

                        <div className={styles.firstStepImage}/>

                        <h3 className={styles.StepCount}>Step 1</h3>
                        <p className={styles.StepPara}>Visit the Website</p>
                    </div>


                    <div className={styles.StepCard}>

                        <div className={styles.secondStepImage}/>

                        <h3 className={styles.StepCount}>Step 2</h3>
                        <p className={styles.StepPara}>Enter your Mobile Number and verify with an OTP</p>
                    </div>


                    <div className={styles.StepCard}>

                        <div className={styles.thirdStepImage}/>

                        <h3 className={styles.StepCount}>Step 3</h3>
                        <p className={styles.StepPara}>Verify KYC and bank details</p>
                    </div>


                    <div className={styles.StepCard}>

                        <div className={styles.forthStepImage}/>

                        <h3 className={styles.StepCount}>Step 4</h3>
                        <p className={styles.StepPara}>eSign your form and documents</p>
                    </div>



            </div>

        </div>

    </div>

    <div className={styles.marginBottom}>
        
    </div>
    
    </>
  )
}

export default StepToOpenAccount