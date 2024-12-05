import styles from './Footer.module.css';
import StepToOpenAccount from './organism/StepToOpenAccount';





const Footer = () => {
    return (
        <>
            <div className={styles.ContainerWrapper}>
                <div className={styles.Container}>

                    <StepToOpenAccount/>

                </div>
            </div>
        </>
    )
}

export default Footer